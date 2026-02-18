import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const initialRegister = {
  name: "",
  email: "",
  password: ""
};

const initialLogin = {
  email: "",
  password: ""
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await login(loginForm.email, loginForm.password);
      navigate("/", { replace: true });
    } catch (error) {
      setMessage("Falha no login. Verifique email e senha.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await register(registerForm);
      navigate("/", { replace: true });
    } catch (error) {
      setMessage("Falha ao criar usuario. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md items-center">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Acesso ao sistema</h1>
        <p className="mt-1 text-sm text-slate-600">Entre com seu usuario ou crie uma conta.</p>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={[
              "rounded-lg px-3 py-2 text-sm font-semibold transition",
              mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-800"
            ].join(" ")}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={[
              "rounded-lg px-3 py-2 text-sm font-semibold transition",
              mode === "register"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            ].join(" ")}
          >
            Criar usuario
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="mt-4 grid gap-3">
            <input
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2.5"
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2.5"
              placeholder="Senha"
              minLength={6}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#006633] px-4 py-2.5 font-semibold text-white hover:bg-[#005a2d] disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-4 grid gap-3">
            <input
              value={registerForm.name}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2.5"
              placeholder="Nome"
              required
            />
            <input
              type="email"
              value={registerForm.email}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2.5"
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={registerForm.password}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2.5"
              placeholder="Senha"
              minLength={6}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#006633] px-4 py-2.5 font-semibold text-white hover:bg-[#005a2d] disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar usuario"}
            </button>
          </form>
        )}

        {message && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p>}
      </section>
    </div>
  );
}
