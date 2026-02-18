import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";

function normalizeSector(sector) {
  const normalized = String(sector || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();

  const firstLetter = normalized[0] || "S";
  const firstConsonant = normalized.split("").find((char) => !"AEIOU".includes(char)) || "X";

  return `${firstLetter}${firstConsonant}`;
}

async function generateUniqueEmployeeCode(sector) {
  const prefix = normalizeSector(sector) || "SX";

  for (let i = 0; i < 20; i += 1) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
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

export async function listRecentEmployees(maxItems = 5) {
  const q = query(collection(db, "employees"), orderBy("createdAt", "desc"), limit(maxItems));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function toggleEmployee(code, active) {
  await updateDoc(doc(db, "employees", code), { active: Boolean(active) });
}

export async function updateEmployee(code, { name, sector, active }) {
  await updateDoc(doc(db, "employees", code), {
    name: String(name || "").trim(),
    sector: String(sector || "").trim(),
    active: Boolean(active)
  });
}

export async function deleteEmployee(code) {
  await deleteDoc(doc(db, "employees", code));
}
