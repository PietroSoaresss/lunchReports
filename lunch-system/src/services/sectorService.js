import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

function normalizeSectorId(sectorName) {
  return String(sectorName || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

export async function listSectors() {
  const q = query(collection(db, "sectors"), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function addSector(sectorName) {
  const name = String(sectorName || "").trim();
  if (!name) {
    throw new Error("SECTOR_REQUIRED");
  }

  const normalizedId = normalizeSectorId(name);
  if (!normalizedId) {
    throw new Error("SECTOR_INVALID");
  }

  const ref = doc(db, "sectors", normalizedId);
  await setDoc(
    ref,
    {
      name,
      normalizedId,
      createdAt: serverTimestamp()
    },
    { merge: true }
  );

  return { id: normalizedId, name };
}
