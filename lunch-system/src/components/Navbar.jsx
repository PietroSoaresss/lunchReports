import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Inicio", end: true },
  { to: "/funcionarios", label: "Cadastro", end: true },
  { to: "/funcionarios/lista", label: "Funcionarios", end: true },
  { to: "/relatorios", label: "Relatorios", end: true }
];

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <h1 className="text-lg font-bold text-slate-800">Sistema de Registro de Almoço</h1>
        <div className="flex gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                [
                  "rounded-lg px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-[#006633] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                ].join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
