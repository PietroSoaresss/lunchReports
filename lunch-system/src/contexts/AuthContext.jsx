import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setProfile(null);
        setToken("");
        setLoadingAuth(false);
        return;
      }

      const nextToken = await nextUser.getIdToken();
      const profileSnap = await getDoc(doc(db, "users", nextUser.uid));
      const profileData = profileSnap.exists() ? profileSnap.data() : null;

      setUser(nextUser);
      setProfile(profileData);
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
    const profileSnap = await getDoc(doc(db, "users", cred.user.uid));
    setProfile(profileSnap.exists() ? profileSnap.data() : null);
    setToken(jwt);
    return cred.user;
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setToken("");
  }

  const role = profile?.role === "admin" ? "admin" : "user";

  const value = useMemo(
    () => ({
      user,
      profile,
      role,
      token,
      loadingAuth,
      login,
      logout
    }),
    [loadingAuth, profile, role, token, user]
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
