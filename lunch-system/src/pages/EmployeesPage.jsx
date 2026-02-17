import { useEffect, useState } from "react";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeList from "../components/EmployeeList";
import { addEmployee, listEmployees, toggleEmployee } from "../services/employeeService";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingCode, setLoadingCode] = useState("");
  const [message, setMessage] = useState("");

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

  async function handleAddEmployee(form) {
    if (!form.name.trim() || !form.sector.trim()) {
      setMessage("Preencha nome e setor.");
      return;
    }

    setLoadingForm(true);
    setMessage("");

    try {
      const generatedCode = await addEmployee(form);
      setMessage(`Funcionario cadastrado com sucesso. Codigo gerado: ${generatedCode}`);
      await refreshEmployees();
    } catch (error) {
      if (error.message === "CODE_GENERATION_FAILED") {
        setMessage("Falha ao gerar codigo unico. Tente novamente.");
      } else {
        setMessage("Falha ao cadastrar funcionario.");
      }
    } finally {
      setLoadingForm(false);
    }
  }

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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <EmployeeForm onSubmit={handleAddEmployee} loading={loadingForm} />
      <EmployeeList employees={employees} onToggle={handleToggle} loadingCode={loadingCode} />
      {message && (
        <div className="md:col-span-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}
    </div>
  );
}
