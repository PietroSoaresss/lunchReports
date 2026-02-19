import { useEffect, useState } from "react";
import LunchReport from "../components/LunchReport";
import MonthlyBarChart from "../components/MonthlyBarChart";
import { exportXLSX, getLastSixMonthsStats, getLunchLogs, getLunchLogsByMonth } from "../services/lunchService";

function getTodayInSaoPaulo() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayInSaoPaulo());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [exportingMonth, setExportingMonth] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [error, setError] = useState("");

  async function loadDailyLogs(date) {
    setLoading(true);
    setError("");

    try {
      const data = await getLunchLogs(date);
      setLogs(data);
    } catch (loadError) {
      setError("Não foi possível carregar o relatório.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMonthlyStats() {
    setLoadingChart(true);
    try {
      const data = await getLastSixMonthsStats();
      setMonthlyStats(data);
    } catch (error) {
      setError("Não foi possível carregar o gráfico mensal.");
    } finally {
      setLoadingChart(false);
    }
  }

  useEffect(() => {
    loadDailyLogs(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    loadMonthlyStats();
  }, []);

  async function handleExportMonthly() {
    const monthRef = selectedDate.slice(0, 7);
    setExportingMonth(true);
    setError("");
    try {
      const monthlyLogs = await getLunchLogsByMonth(monthRef);
      if (monthlyLogs.length === 0) {
        setError("Não há registros para exportar no mês selecionado.");
        return;
      }
      await exportXLSX(monthlyLogs, `${monthRef}_mensal`);
    } catch (exportError) {
      setError("Não foi possível exportar o relatório mensal.");
    } finally {
      setExportingMonth(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Data do relatório</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            type="button"
            onClick={handleExportMonthly}
            disabled={exportingMonth}
            className="rounded-lg border border-[#006633] px-4 py-2 text-sm font-semibold text-[#006633] hover:bg-emerald-50 disabled:opacity-50"
          >
            {exportingMonth ? "Exportando..." : "Exportar mensal XLSX"}
          </button>
        </div>
      </section>

      {error && <p className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p>}

      <MonthlyBarChart data={monthlyStats} loading={loadingChart} />
      <LunchReport logs={logs} date={selectedDate} onExportXLSX={exportXLSX} loading={loading} />
    </div>
  );
}
