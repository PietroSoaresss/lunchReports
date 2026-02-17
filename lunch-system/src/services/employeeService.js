import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";

function normalizeSector(sector) {
  return String(sector || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 6);
}

async function generateUniqueEmployeeCode(sector) {
  const prefix = normalizeSector(sector) || "SETOR";

  for (let i = 0; i < 20; i += 1) {
    const suffix = Math.floor(100000 + Math.random() * 900000);
    const code = `${prefix}-${suffix}`;
    const ref = doc(db, "employees", code);
    const existing = await getDoc(ref);
    if (!existing.exists()) {
      return code;
    }
  }

  throw new Error("CODE_GENERATION_FAILED");
}

export async function addEmployee({ name, sector, active = true }) {
  const normalizedCode = await generateUniqueEmployeeCode(sector);
  const ref = doc(db, "employees", normalizedCode);

  await setDoc(ref, {
    name: String(name || "").trim(),
    sector: String(sector || "").trim(),
    code: normalizedCode,
    active: Boolean(active),
    createdAt: serverTimestamp()
  });

  return normalizedCode;
}

export async function listEmployees() {
  const q = query(collection(db, "employees"), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function toggleEmployee(code, active) {
  await updateDoc(doc(db, "employees", code), { active: Boolean(active) });
}
