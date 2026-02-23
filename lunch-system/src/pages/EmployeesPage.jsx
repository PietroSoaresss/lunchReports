import { useEffect, useState } from "react";
import EmployeeForm from "../components/EmployeeForm";
import { SkeletonSidebar, Spinner } from "../components/Skeleton";
import { addEmployee, listRecentEmployees } from "../services/employeeService";
import { addSector, listSectors } from "../services/sectorService";

export default function EmployeesPage() {
  const [loadingForm, setLoadingForm] = useState(false);
  const [message, setMessage] = useState("");
  const [sectorMessage, setSectorMessage] = useState("");
  const [sectors, setSectors] = useState([]);
  const [newSector, setNewSector] = useState("");
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [savingSector, setSavingSector] = useState(false);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [recentError, setRecentError] = useState("");
  const successMessage = message.startsWith("Funcionário cadastrado com sucesso");
  const sectorSuccessMessage = sectorMessage.startsWith("Setor cadastrado com sucesso");

  async function loadRecentEmployees(showLoading = true) {
    if (showLoading) setLoadingRecent(true);
    setRecentError("");
    try {
      const data = await listRecentEmployees(10);
      setRecentEmployees(data);
    } catch (error) {
      setRecentError("Não foi possível atualizar os últimos cadastrados.");
    } finally {
      if (showLoading) setLoadingRecent(false);
    }
  }

  async function loadSectors(showLoading = true) {
    if (showLoading) setLoadingSectors(true);
    try {
      const data = await listSectors();
      setSectors(data);
    } catch (error) {
      setSectors([]);
      setSectorMessage("Falha ao carregar setores.");
    } finally {
      if (showLoading) setLoadingSectors(false);
    }
  }

  useEffect(() => {
    loadRecentEmployees();
    loadSectors();
  }, []);

  async function handleAddSector(event) {
    event.preventDefault();

    if (!newSector.trim()) {
      setSectorMessage("Informe o nome do setor.");
      return;
    }

    setSavingSector(true);
    setSectorMessage("");

    try {
      await addSector(newSector);
      setSectorMessage("Setor cadastrado com sucesso.");
      setNewSector("");
      await loadSectors(false);
    } catch (error) {
      setSectorMessage("Falha ao cadastrar setor.");
    } finally {
      setSavingSector(false);
    }
  }

  async function handleAddEmployee(form) {
    if (!form.name.trim() || !form.sector.trim()) {
      setMessage("Preencha nome e setor.");
      return;
    }

    setLoadingForm(true);
    setMessage("");

    try {
      const generatedCode = await addEmployee(form);
      setMessage(`Funcionário cadastrado com sucesso. Código gerado: ${generatedCode}`);
      await loadRecentEmployees(false);
    } catch (error) {
      if (error.message === "CODE_GENERATION_FAILED") {
        setMessage("Falha ao gerar código único. Tente novamente.");
      } else {
        setMessage("Falha ao cadastrar funcionário.");
      }
    } finally {
      setLoadingForm(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-4">
        <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Cadastro de funcionários
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Novo colaborador</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Registre o funcionário para gerar o código único usado no ponto de almoço.
          </p>
        </section>

        <form
          onSubmit={handleAddSector}
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Cadastrar novo setor</span>
            <input
              value={newSector}
              onChange={(event) => setNewSector(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 transition focus:border-[#006633] focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Ex.: Financeiro"
            />
          </label>
          <button
            type="submit"
            disabled={savingSector}
            className="flex items-center gap-2 self-end rounded-lg border border-[#006633] px-4 py-2.5 font-semibold text-[#006633] transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingSector ? <><Spinner size="sm" className="text-[#006633]" /> Salvando...</> : "Cadastrar setor"}
          </button>
          {sectorMessage && (
            <div
              className={[
                "sm:col-span-2 rounded-xl border px-4 py-3 text-sm",
                sectorSuccessMessage
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              ].join(" ")}
            >
              {sectorMessage}
            </div>
          )}
        </form>

        <EmployeeForm
          onSubmit={handleAddEmployee}
          loading={loadingForm}
          sectors={sectors}
          loadingSectors={loadingSectors}
        />

        {message && (
          <div
            className={[
              "rounded-xl border px-4 py-3 text-sm",
              successMessage
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            ].join(" ")}
          >
            {message}
          </div>
        )}
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Últimos 10 cadastrados
        </h2>

        {loadingRecent && recentEmployees.length === 0 ? (
          <div className="mt-3"><SkeletonSidebar items={5} /></div>
        ) : recentEmployees.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nenhum funcionário cadastrado.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recentEmployees.map((employee) => (
              <li key={employee.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-sm font-medium text-slate-800">{employee.name}</p>
                <p className="text-xs text-slate-500">
                  {employee.sector} - {employee.code}
                </p>
              </li>
            ))}
          </ul>
        )}

        {recentError && <p className="mt-3 text-xs text-rose-600">{recentError}</p>}
      </aside>
    </div>
  );
}
