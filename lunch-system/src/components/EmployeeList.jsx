import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

export default function EmployeeList({ employees, onToggle, onEdit, onDelete, loadingCode }) {
  const [page, setPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(employees.length / PAGE_SIZE));
  }, [employees.length]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const pagedEmployees = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return employees.slice(start, start + PAGE_SIZE);
  }, [employees, page]);

  const startItem = employees.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, employees.length);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Funcionarios</h2>
        {employees.length > 0 && (
          <span className="text-sm text-slate-600">
            Mostrando {startItem}-{endItem} de {employees.length}
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {pagedEmployees.map((employee) => (
          <li
            key={employee.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
          >
            <div>
              <p className="font-medium text-slate-800">{employee.name}</p>
              <p className="text-xs text-slate-500">Setor: {employee.sector || "-"}</p>
              <p className="text-xs text-slate-500">Codigo: {employee.code}</p>
              <p className="text-xs text-slate-500">Status: {employee.active ? "Ativo" : "Inativo"}</p>
            </div>
            {(typeof onToggle === "function" || typeof onEdit === "function" || typeof onDelete === "function") && (
              <div className="flex gap-2">
                {typeof onToggle === "function" && (
                  <button
                    onClick={() => onToggle(employee.code, !employee.active)}
                    disabled={loadingCode === employee.code}
                    className={[
                      "rounded-lg px-3 py-1 text-sm font-semibold text-white",
                      employee.active ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700",
                      loadingCode === employee.code ? "opacity-50" : ""
                    ].join(" ")}
                  >
                    {loadingCode === employee.code ? "..." : employee.active ? "Desativar" : "Ativar"}
                  </button>
                )}
                {typeof onEdit === "function" && (
                  <button
                    onClick={() => onEdit(employee)}
                    disabled={loadingCode === employee.code}
                    className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Editar
                  </button>
                )}
                {typeof onDelete === "function" && (
                  <button
                    onClick={() => onDelete(employee)}
                    disabled={loadingCode === employee.code}
                    className="rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Excluir
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {employees.length === 0 && <p className="text-sm text-slate-500">Nenhum funcionario cadastrado.</p>}
      {employees.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-600">Pagina {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Proxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
