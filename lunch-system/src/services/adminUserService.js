import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

export async function listUsersWithRole() {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}
