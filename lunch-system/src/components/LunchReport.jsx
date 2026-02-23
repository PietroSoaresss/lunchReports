import { SkeletonTable } from "./Skeleton";

export default function LunchReport({ logs, date, onExportXLSX, loading }) {
  async function handleExportXLSX() {
    try {
      await onExportXLSX(logs, date);
    } catch (error) {
      window.alert("Falha ao exportar XLSX.");
    }
  }

  function formatTime(value) {
    if (!value) return "";
    if (typeof value?.toDate === "function") {
      return value.toDate().toLocaleTimeString("pt-BR");
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleTimeString("pt-BR");
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Registros do dia</h2>
        <button
          onClick={handleExportXLSX}
          disabled={logs.length === 0}
          className="rounded-lg bg-[#006633] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005a2d] disabled:opacity-50"
        >
          Exportar XLSX
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-2 h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Nenhum registro encontrado para a data selecionada.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="px-2 py-2">Nome</th>
                <th className="px-2 py-2">Código</th>
                <th className="px-2 py-2">Horário</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const time = formatTime(log.registeredAt);
                return (
                  <tr key={log.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="px-2 py-2">{log.employeeName}</td>
                    <td className="px-2 py-2">{log.employeeCode}</td>
                    <td className="px-2 py-2">{time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
