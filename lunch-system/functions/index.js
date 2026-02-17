const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.registerLunch = onCall({ region: "southamerica-east1" }, async (request) => {
  const { employeeCode } = request.data ?? {};

  if (!employeeCode || typeof employeeCode !== "string") {
    throw new HttpsError("invalid-argument", "Codigo invalido.");
  }

  const normalizedCode = employeeCode.trim();
  const empRef = db.collection("employees").doc(normalizedCode);
  const empSnap = await empRef.get();

  if (!empSnap.exists) {
    return { status: "NOT_FOUND" };
  }

  const employee = empSnap.data();
  if (!employee.active) {
    return { status: "INACTIVE" };
  }

  const now = new Date();
  const dayLocal = now.toLocaleDateString("sv-SE", {
    timeZone: "America/Sao_Paulo"
  });

  const logRef = db.collection("lunch_logs").doc(`${normalizedCode}_${dayLocal}`);

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(logRef);
      if (snap.exists) {
        throw { code: "ALREADY_EXISTS", data: snap.data() };
      }

      tx.set(logRef, {
        employeeCode: normalizedCode,
        employeeName: employee.name,
        dayLocal,
        registeredAt: FieldValue.serverTimestamp(),
        source: "BARCODE"
      });
    });

    return {
      status: "OK",
      employeeName: employee.name,
      dayLocal,
      registeredAt: new Date().toISOString()
    };
  } catch (err) {
    if (err.code === "ALREADY_EXISTS") {
      return {
        status: "ALREADY_REGISTERED",
        employeeName: employee.name,
        registeredAt: err.data.registeredAt?.toDate?.()?.toISOString() ?? null
      };
    }

    throw new HttpsError("internal", "Erro interno ao registrar.");
  }
});

exports.listEmployees = onCall({ region: "southamerica-east1" }, async () => {
  const snap = await db.collection("employees").orderBy("name", "asc").get();
  const employees = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  return { employees };
});

exports.addEmployee = onCall({ region: "southamerica-east1" }, async (request) => {
  const { name, code, active = true } = request.data ?? {};

  if (!name || typeof name !== "string" || !code || typeof code !== "string") {
    throw new HttpsError("invalid-argument", "Dados invalidos para funcionario.");
  }

  const normalizedCode = code.trim();
  const normalizedName = name.trim();
  if (!normalizedCode || !normalizedName) {
    throw new HttpsError("invalid-argument", "Nome e codigo sao obrigatorios.");
  }

  const ref = db.collection("employees").doc(normalizedCode);
  const existing = await ref.get();
  if (existing.exists) {
    return { status: "EMPLOYEE_CODE_EXISTS" };
  }

  await ref.set({
    name: normalizedName,
    code: normalizedCode,
    active: Boolean(active),
    createdAt: FieldValue.serverTimestamp()
  });

  return { status: "OK" };
});

exports.toggleEmployee = onCall({ region: "southamerica-east1" }, async (request) => {
  const { code, active } = request.data ?? {};

  if (!code || typeof code !== "string" || typeof active !== "boolean") {
    throw new HttpsError("invalid-argument", "Dados invalidos para atualizacao.");
  }

  const ref = db.collection("employees").doc(code.trim());
  const snap = await ref.get();
  if (!snap.exists) {
    return { status: "NOT_FOUND" };
  }

  await ref.update({ active });
  return { status: "OK" };
});

exports.getLunchLogs = onCall({ region: "southamerica-east1" }, async (request) => {
  const { dayLocal } = request.data ?? {};

  if (!dayLocal || typeof dayLocal !== "string") {
    throw new HttpsError("invalid-argument", "Data invalida.");
  }

  const snap = await db
    .collection("lunch_logs")
    .where("dayLocal", "==", dayLocal)
    .orderBy("registeredAt", "asc")
    .get();

  const logs = snap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      employeeCode: data.employeeCode,
      employeeName: data.employeeName,
      dayLocal: data.dayLocal,
      source: data.source,
      registeredAt: data.registeredAt?.toDate?.()?.toISOString() ?? null
    };
  });

  return { logs };
});
