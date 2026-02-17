export default function EmployeeList({ employees, onToggle, loadingCode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Funcionarios</h2>
      <ul className="space-y-2">
        {employees.map((employee) => (
          <li
            key={employee.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
          >
            <div>
              <p className="font-medium text-slate-800">{employee.name}</p>
              <p className="text-xs text-slate-500">Setor: {employee.sector || "-"}</p>
              <p className="text-xs text-slate-500">Codigo: {employee.code}</p>
            </div>
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
          </li>
        ))}
      </ul>
      {employees.length === 0 && <p className="text-sm text-slate-500">Nenhum funcionario cadastrado.</p>}
    </div>
  );
}
