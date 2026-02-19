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
        <p className="text-slate-600">Carregando...</p>
      ) : logs.length === 0 ? (
        <p className="text-slate-600">Nenhum registro encontrado para a data selecionada.</p>
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
                  <tr key={log.id} className="border-b border-slate-100">
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
