import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where
} from "firebase/firestore";
import { db } from "./firebase";

function getDayLocalSaoPaulo() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

function formatTime(value) {
  if (!value) return "";
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleTimeString("pt-BR");
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("pt-BR");
}

function getLastSixMonthBuckets() {
  const today = getDayLocalSaoPaulo();
  const [year, month] = today.split("-").map(Number);
  const startMonthRef = new Date(Date.UTC(year, month - 1, 1));
  const formatter = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" });
  const buckets = [];

  for (let offset = -5; offset <= 0; offset += 1) {
    const monthRef = new Date(
      Date.UTC(startMonthRef.getUTCFullYear(), startMonthRef.getUTCMonth() + offset, 1)
    );
    const bucketYear = monthRef.getUTCFullYear();
    const bucketMonth = String(monthRef.getUTCMonth() + 1).padStart(2, "0");
    const key = `${bucketYear}-${bucketMonth}`;
    const label = formatter.format(monthRef).replace(".", "");
    buckets.push({ key, label, count: 0 });
  }

  return buckets;
}

export async function registerLunch(employeeCode) {
  const normalizedCode = String(employeeCode || "").trim();
  if (!normalizedCode) {
    return { status: "NOT_FOUND" };
  }

  const employeeRef = doc(db, "employees", normalizedCode);
  const dayLocal = getDayLocalSaoPaulo();
  const logRef = doc(db, "lunch_logs", `${normalizedCode}_${dayLocal}`);

  try {
    const result = await runTransaction(db, async (tx) => {
      const employeeSnap = await tx.get(employeeRef);
      if (!employeeSnap.exists()) {
        return { status: "NOT_FOUND" };
      }

      const employee = employeeSnap.data();
      if (!employee.active) {
        return { status: "INACTIVE" };
      }

      const logSnap = await tx.get(logRef);
      if (logSnap.exists()) {
        return {
          status: "ALREADY_REGISTERED",
          employeeName: employee.name,
          registeredAt: logSnap.data()?.registeredAt?.toDate?.()?.toISOString() ?? null
        };
      }

      tx.set(logRef, {
        employeeCode: normalizedCode,
        employeeName: employee.name,
        dayLocal,
        registeredAt: serverTimestamp(),
        source: "BARCODE"
      });

      return {
        status: "OK",
        employeeName: employee.name,
        dayLocal,
        registeredAt: new Date().toISOString()
      };
    });

    return result;
  } catch (error) {
    return { status: "ERROR" };
  }
}

export async function getLunchLogs(dayLocal) {
  const q = query(collection(db, "lunch_logs"), where("dayLocal", "==", dayLocal));

  const snap = await getDocs(q);
  return snap.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .sort((a, b) => {
      const aTime =
        typeof a?.registeredAt?.toDate === "function"
          ? a.registeredAt.toDate().getTime()
          : new Date(a?.registeredAt || 0).getTime();
      const bTime =
        typeof b?.registeredAt?.toDate === "function"
          ? b.registeredAt.toDate().getTime()
          : new Date(b?.registeredAt || 0).getTime();
      return aTime - bTime;
    });
}

export async function getLunchLogsByMonth(monthRef) {
  const normalizedMonth = String(monthRef || "").slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(normalizedMonth)) {
    return [];
  }

  const startDay = `${normalizedMonth}-01`;
  const endDay = `${normalizedMonth}-31`;
  const q = query(
    collection(db, "lunch_logs"),
    where("dayLocal", ">=", startDay),
    where("dayLocal", "<=", endDay)
  );

  const snap = await getDocs(q);
  return snap.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .sort((a, b) => {
      const aDay = String(a?.dayLocal || "");
      const bDay = String(b?.dayLocal || "");
      if (aDay !== bDay) return aDay.localeCompare(bDay);

      const aTime =
        typeof a?.registeredAt?.toDate === "function"
          ? a.registeredAt.toDate().getTime()
          : new Date(a?.registeredAt || 0).getTime();
      const bTime =
        typeof b?.registeredAt?.toDate === "function"
          ? b.registeredAt.toDate().getTime()
          : new Date(b?.registeredAt || 0).getTime();
      return aTime - bTime;
    });
}

export async function getLastSixMonthsStats() {
  const buckets = getLastSixMonthBuckets();
  const today = getDayLocalSaoPaulo();
  const startDayLocal = `${buckets[0].key}-01`;

  const q = query(
    collection(db, "lunch_logs"),
    where("dayLocal", ">=", startDayLocal),
    where("dayLocal", "<=", today)
  );

  const snap = await getDocs(q);
  const countByMonth = new Map(buckets.map((bucket) => [bucket.key, 0]));

  snap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const monthKey = String(data.dayLocal || "").slice(0, 7);
    if (countByMonth.has(monthKey)) {
      countByMonth.set(monthKey, countByMonth.get(monthKey) + 1);
    }
  });

  return buckets.map((bucket) => ({ ...bucket, count: countByMonth.get(bucket.key) || 0 }));
}


export async function getRecentLunchLogs(maxItems = 10) {
  const q = query(collection(db, "lunch_logs"), orderBy("registeredAt", "desc"), limit(maxItems));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

export function exportCSV(logs, date) {
  const header = "Nome,Código,Dia,Horário\n";
  const rows = logs
    .map((log) => {
      const time = formatTime(log.registeredAt);
      return `"${log.employeeName}","${log.employeeCode}","${log.dayLocal}","${time}"`;
    })
    .join("\n");

  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `almoço_${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportXLSX(logs, date) {
  const mod = await import("xlsx");
  const XLSX = mod?.utils ? mod : mod?.default;
  if (!XLSX?.utils || typeof XLSX.writeFile !== "function") {
    throw new Error("XLSX_EXPORT_UNAVAILABLE");
  }

  const rows = logs.map((log) => ({
    Nome: log.employeeName || "",
    Código: log.employeeCode || "",
    Dia: log.dayLocal || "",
    Horário: formatTime(log.registeredAt)
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");
  XLSX.writeFile(workbook, `almoço_${date}.xlsx`);
}
