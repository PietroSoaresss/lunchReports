import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const links = [
  { to: "/", label: "Inicio", end: true },
  { to: "/funcionarios", label: "Cadastro", end: true },
  { to: "/funcionarios/lista", label: "Funcionarios", end: true },
  { to: "/relatorios", label: "Relatorios", end: true }
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <h1 className="text-lg font-bold text-slate-800">Sistema de Registro de Almoco</h1>

        {!user ? (
          <span className="text-sm font-semibold text-slate-500">Nao autenticado</span>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    [
                      "rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ease-out",
                      isActive
                        ? "bg-[#006633] text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:-translate-y-0.5 hover:bg-slate-200"
                    ].join(" ")
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            <span className="ml-1 hidden text-xs text-slate-500 sm:block">{user.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
