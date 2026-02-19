import { useEffect, useState } from "react";
import { listUsersWithRole } from "../services/adminUserService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [message, setMessage] = useState("");

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const data = await listUsersWithRole();
      setUsers(data);
    } catch (error) {
      setMessage("Falha ao carregar usuários.");
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Criação de usuários</h2>
        <p className="mt-2 text-sm text-slate-600">
          Crie usuários manualmente no Firebase Console: Authentication (email/senha) e depois
          coleção <strong>users</strong> com o campo <strong>role</strong> igual a <strong>admin</strong> ou
          <strong> user</strong>.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Usuários cadastrados</h2>
        {loadingUsers ? (
          <p className="mt-2 text-sm text-slate-600">Carregando...</p>
        ) : users.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Nenhum usuário encontrado.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {users.map((item) => (
              <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-sm font-medium text-slate-800">{item.name || "-"}</p>
                <p className="text-xs text-slate-500">
                  {item.email} - {item.role}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {message && <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p>}
    </div>
  );
}
