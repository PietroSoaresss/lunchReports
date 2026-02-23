import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/Skeleton";
import { useAuth } from "../contexts/AuthContext";

const initialLogin = {
  email: "",
  password: ""
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginForm, setLoginForm] = useState(initialLogin);
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

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md items-center">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Login</h1>
        <p className="mt-1 text-sm text-slate-600">Entre com email e senha cadastrados pelo administrador.</p>

        <form onSubmit={handleLogin} className="mt-6 grid gap-3">
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
            className="flex items-center justify-center gap-2 rounded-lg bg-[#006633] px-4 py-2.5 font-semibold text-white transition-all hover:bg-[#005a2d] disabled:opacity-50"
          >
            {loading ? <><Spinner size="sm" className="text-white" /> Entrando...</> : "Entrar"}
          </button>
        </form>

        {message && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p>}
      </section>
    </div>
  );
}
