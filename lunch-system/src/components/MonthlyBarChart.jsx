export default function MonthlyBarChart({ data, loading }) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-4 text-lg font-semibold">Registros nos últimos 6 meses</h2>

      {loading ? (
        <p className="text-slate-600">Carregando gráfico...</p>
      ) : (
        <div className="grid grid-cols-6 gap-3">
          {data.map((item) => {
            const heightPercent = Math.max((item.count / max) * 100, item.count > 0 ? 8 : 2);
            return (
              <div key={item.key} className="flex flex-col items-center">
                <span className="mb-1 text-xs font-semibold text-slate-700">{item.count}</span>
                <div className="flex h-40 w-full items-end rounded-md bg-slate-100 px-2 py-2">
                  <div
                    className="w-full rounded-md bg-[#006633] transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="mt-2 text-xs text-slate-600">{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
