import { useEffect, useMemo, useState } from "react";
import EmployeeList from "../components/EmployeeList";
import { deleteEmployee, listEmployees, toggleEmployee, updateEmployee } from "../services/employeeService";

const initialEditForm = {
  name: "",
  sector: "",
  active: true
};

export default function EmployeesListPage() {
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingCode, setLoadingCode] = useState("");
  const [editingCode, setEditingCode] = useState("");
  const [pendingDeleteEmployee, setPendingDeleteEmployee] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    sector: "",
    code: ""
  });
  const [editForm, setEditForm] = useState(initialEditForm);

  const filteredEmployees = useMemo(() => {
    const nameFilter = filters.name.trim().toLowerCase();
    const sectorFilter = filters.sector.trim().toLowerCase();
    const codeFilter = filters.code.trim().toLowerCase();

    return employees.filter((employee) => {
      const employeeName = String(employee.name || "").toLowerCase();
      const employeeSector = String(employee.sector || "").toLowerCase();
      const employeeCode = String(employee.code || "").toLowerCase();

      if (nameFilter && !employeeName.includes(nameFilter)) return false;
      if (sectorFilter && !employeeSector.includes(sectorFilter)) return false;
      if (codeFilter && !employeeCode.includes(codeFilter)) return false;
      return true;
    });
  }, [employees, filters.code, filters.name, filters.sector]);

  async function refreshEmployees() {
    const data = await listEmployees();
    setEmployees(data);
  }

  useEffect(() => {
    (async () => {
      try {
        await refreshEmployees();
      } catch (error) {
        setMessage("Falha ao carregar funcionarios.");
      }
    })();
  }, []);

  async function handleToggle(code, active) {
    setLoadingCode(code);
    setMessage("");

    try {
      await toggleEmployee(code, active);
      setMessage(active ? "Funcionario ativado." : "Funcionario desativado.");
      await refreshEmployees();
    } catch (error) {
      setMessage("Falha ao atualizar funcionario.");
    } finally {
      setLoadingCode("");
    }
  }

  function handleStartEdit(employee) {
    setMessage("");
    setEditingCode(employee.code);
    setEditForm({
      name: employee.name || "",
      sector: employee.sector || "",
      active: Boolean(employee.active)
    });
  }

  function handleCancelEdit() {
    setEditingCode("");
    setEditForm(initialEditForm);
  }

  async function handleSaveEdit(event) {
    event.preventDefault();

    if (!editingCode) {
      return;
    }

    if (!editForm.name.trim() || !editForm.sector.trim()) {
      setMessage("Preencha nome e setor para editar.");
      return;
    }

    setLoadingCode(editingCode);
    setMessage("");

    try {
      await updateEmployee(editingCode, editForm);
      setMessage("Funcionario atualizado com sucesso.");
      setEditingCode("");
      setEditForm(initialEditForm);
      await refreshEmployees();
    } catch (error) {
      setMessage("Falha ao editar funcionario.");
    } finally {
      setLoadingCode("");
    }
  }

  function handleDelete(employee) {
    setPendingDeleteEmployee(employee);
  }

  function handleCancelDelete() {
    setPendingDeleteEmployee(null);
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteEmployee) {
      return;
    }

    setLoadingCode(pendingDeleteEmployee.code);
    setMessage("");

    try {
      await deleteEmployee(pendingDeleteEmployee.code);
      setMessage("Funcionario excluido com sucesso.");
      if (editingCode === pendingDeleteEmployee.code) {
        setEditingCode("");
        setEditForm(initialEditForm);
      }
      await refreshEmployees();
      setPendingDeleteEmployee(null);
    } catch (error) {
      setMessage("Falha ao excluir funcionario.");
    } finally {
      setLoadingCode("");
    }
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <input
          value={filters.name}
          onChange={(event) => setFilters((prev) => ({ ...prev, name: event.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Filtrar por nome"
        />
        <input
          value={filters.sector}
          onChange={(event) => setFilters((prev) => ({ ...prev, sector: event.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Filtrar por setor"
        />
        <input
          value={filters.code}
          onChange={(event) => setFilters((prev) => ({ ...prev, code: event.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Filtrar por codigo"
        />
      </section>

      <EmployeeList
        employees={filteredEmployees}
        onToggle={handleToggle}
        onEdit={handleStartEdit}
        onDelete={handleDelete}
        loadingCode={loadingCode}
      />
      {message && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      {pendingDeleteEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Confirmar exclusao</h3>
            <p className="mt-2 text-sm text-slate-600">
              Deseja excluir <strong>{pendingDeleteEmployee.name}</strong> ({pendingDeleteEmployee.code})?
            </p>
            <p className="mt-1 text-xs text-rose-600">Esta acao nao pode ser desfeita.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={loadingCode === pendingDeleteEmployee.code}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loadingCode === pendingDeleteEmployee.code}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loadingCode === pendingDeleteEmployee.code ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <form onSubmit={handleSaveEdit} className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Editar funcionario</h3>
                <p className="text-sm text-slate-500">Atualize os dados e confirme para salvar.</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                Codigo: {editingCode}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Nome</span>
                <input
                  value={editForm.name}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Nome"
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Setor</span>
                <input
                  value={editForm.sector}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, sector: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Setor"
                  required
                />
              </label>
            </div>
            <label className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
              <span>Status no sistema</span>
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.active}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, active: event.target.checked }))}
                />
                {editForm.active ? "Ativo" : "Inativo"}
              </span>
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={loadingCode === editingCode}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loadingCode === editingCode}
                className="rounded-lg bg-[#006633] px-4 py-2 font-semibold text-white hover:bg-[#005a2d] disabled:opacity-50"
              >
                {loadingCode === editingCode ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
