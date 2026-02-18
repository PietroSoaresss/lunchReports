import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setToken("");
        setLoadingAuth(false);
        return;
      }

      const nextToken = await nextUser.getIdToken();
      setUser(nextUser);
      setToken(nextToken);
      setLoadingAuth(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!token) {
      localStorage.removeItem("auth_jwt");
      return;
    }
    localStorage.setItem("auth_jwt", token);
  }, [token]);

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, String(email || "").trim(), password);
    const jwt = await cred.user.getIdToken();
    setToken(jwt);
    return cred.user;
  }

  async function register({ name, email, password }) {
    const cred = await createUserWithEmailAndPassword(auth, String(email || "").trim(), password);
    const normalizedName = String(name || "").trim();

    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name: normalizedName || cred.user.email || "",
      email: cred.user.email || "",
      role: "user",
      createdAt: serverTimestamp()
    });

    const jwt = await cred.user.getIdToken();
    setToken(jwt);
    return cred.user;
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setToken("");
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loadingAuth,
      login,
      register,
      logout
    }),
    [loadingAuth, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return ctx;
}
