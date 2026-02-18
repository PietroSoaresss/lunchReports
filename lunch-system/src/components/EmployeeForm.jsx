import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  sector: "",
  active: true
};

export default function EmployeeForm({ onSubmit, loading, sectors = [], loadingSectors = false }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!form.sector && sectors.length > 0) {
      setForm((prev) => ({ ...prev, sector: sectors[0].name }));
    }
  }, [form.sector, sectors]);

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialForm);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Dados do funcionario</h2>
        <p className="text-sm text-slate-500">Campos com * sao obrigatorios.</p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Nome completo *</span>
        <input
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2.5 transition focus:border-[#006633] focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder="Ex.: Ana Silva"
          required
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Setor *</span>
        <select
          value={form.sector}
          onChange={(event) => setForm((prev) => ({ ...prev, sector: event.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2.5 transition focus:border-[#006633] focus:outline-none focus:ring-2 focus:ring-emerald-100"
          disabled={loadingSectors || sectors.length === 0}
          required
        >
          {sectors.length === 0 ? (
            <option value="">
              {loadingSectors ? "Carregando setores..." : "Cadastre um setor primeiro"}
            </option>
          ) : (
            sectors.map((sector) => (
              <option key={sector.id} value={sector.name}>
                {sector.name}
              </option>
            ))
          )}
        </select>
      </label>

      <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
        <span>Status no sistema</span>
        <span className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
          />
          {form.active ? "Ativo" : "Inativo"}
        </span>
      </label>

      <button
        type="submit"
        disabled={loading || loadingSectors || sectors.length === 0}
        className="rounded-lg bg-[#006633] px-4 py-2.5 font-semibold text-white transition hover:bg-[#005a2d] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Cadastrar"}
      </button>
    </form>
  );
}
