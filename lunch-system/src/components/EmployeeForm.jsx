import { useState } from "react";

const initialForm = {
  name: "",
  sector: "",
  active: true
};

export default function EmployeeForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialForm);

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialForm);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Novo funcionario</h2>
      <input
        value={form.name}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        className="rounded-lg border border-slate-300 px-3 py-2"
        placeholder="Nome"
        required
      />
      <input
        value={form.sector}
        onChange={(event) => setForm((prev) => ({ ...prev, sector: event.target.value }))}
        className="rounded-lg border border-slate-300 px-3 py-2"
        placeholder="Setor"
        required
      />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
        />
        Ativo
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[#006633] px-4 py-2 font-semibold text-white hover:bg-[#005a2d] disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Cadastrar"}
      </button>
    </form>
  );
}
