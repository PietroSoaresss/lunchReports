import { useCallback, useEffect, useRef, useState } from "react";
import { getRecentLunchLogs, registerLunch } from "../services/lunchService";

function formatLogTime(value) {
  if (!value) return "";
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function HomePage() {
  const inputRef = useRef(null);
  const autoSubmitTimerRef = useRef(null);
  const clearCodeTimerRef = useRef(null);
  const clearFeedbackTimerRef = useRef(null);
  const submittingRef = useRef(false);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  async function loadRecentHistory() {
    try {
      const logs = await getRecentLunchLogs(10);
      setHistory(logs);
      setHistoryError("");
    } catch (error) {
      setHistoryError("Não foi possível carregar os últimos registros.");
    }
  }

  useEffect(() => {
    inputRef.current?.focus();
    loadRecentHistory();
  }, []);

  const resetInput = useCallback(() => {
    if (clearCodeTimerRef.current) clearTimeout(clearCodeTimerRef.current);
    if (clearFeedbackTimerRef.current) clearTimeout(clearFeedbackTimerRef.current);

    clearCodeTimerRef.current = setTimeout(() => {
      setCode("");
      inputRef.current?.focus();
    }, 120);

    clearFeedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
      inputRef.current?.focus();
    }, 1200);
  }, []);

  async function submitCode(rawCode) {
    const normalizedCode = String(rawCode || "").trim();
    if (!normalizedCode || loading || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    try {
      const data = await registerLunch(normalizedCode);

      if (data.status === "OK") {
        setFeedback({
          type: "success",
          message: `Almoço registrado! ${data.employeeName}`
        });
        await loadRecentHistory();
      } else if (data.status === "ALREADY_REGISTERED") {
        const time = data.registeredAt
          ? new Date(data.registeredAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit"
            })
          : "";

        setFeedback({
          type: "warning",
          message: `Você já registrou hoje às ${time}`
        });
      } else if (data.status === "NOT_FOUND") {
        setFeedback({ type: "error", message: "Funcionário não encontrado" });
      } else if (data.status === "INACTIVE") {
        setFeedback({ type: "inactive", message: "Funcionário inativo" });
      } else {
        setFeedback({ type: "error", message: "Resposta inesperada do servidor." });
      }
    } catch (error) {
      setFeedback({ type: "error", message: "Erro de comunicação com o servidor." });
    } finally {
      submittingRef.current = false;
      setLoading(false);
      resetInput();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await submitCode(code);
  }

  useEffect(() => {
    if (loading) return;
    if (!code.trim()) return;

    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
    }

    autoSubmitTimerRef.current = setTimeout(() => {
      submitCode(code);
    }, 120);

    return () => {
      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current);
      }
    };
  }, [code, loading]);

  return (
    <div className="mx-auto flex min-h-[75vh] w-full max-w-2xl flex-col items-center justify-center">
      <h1 className="mb-8 text-3xl font-bold">Registrar Almoço</h1>

      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <input
          ref={inputRef}
          autoFocus
          value={code}
          onChange={(event) => {
            const next = event.target.value.replace(/[\r\n]/g, "");
            setCode(next);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === "NumpadEnter") {
              event.preventDefault();
              submitCode(code);
            }
          }}
          onBlur={() => setTimeout(() => inputRef.current?.focus(), 0)}
          placeholder="Digite ou escaneie o código..."
          className="flex-1 rounded-lg border-2 border-slate-300 px-4 py-3 text-lg focus:border-[#006633] focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#006633] px-6 py-3 font-semibold text-white hover:bg-[#005a2d] disabled:opacity-50"
        >
          {loading ? "..." : "Enviar"}
        </button>
      </form>

      {feedback && (
        <div
          className={[
            "mt-6 w-full rounded-xl border p-4 text-center text-lg font-medium",
            feedback.type === "success" ? "border-green-300 bg-green-100 text-green-800" : "",
            feedback.type === "warning" ? "border-yellow-300 bg-yellow-100 text-yellow-800" : "",
            feedback.type === "error" ? "border-red-300 bg-red-100 text-red-800" : "",
            feedback.type === "inactive" ? "border-orange-300 bg-orange-100 text-orange-800" : ""
          ].join(" ")}
        >
          {feedback.message}
        </div>
      )}

      <div className="mt-8 w-full">
        <h2 className="mb-2 text-sm font-semibold text-slate-500">Últimos 10 registros</h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum registro encontrado.</p>
        ) : (
          <ul className="space-y-1">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{item.employeeName}</p>
                  <p className="text-xs text-slate-500">{item.employeeCode}</p>
                </div>
                <span className="text-slate-500">{formatLogTime(item.registeredAt)}</span>
              </li>
            ))}
          </ul>
        )}
        {historyError && <p className="mt-2 text-xs text-rose-600">{historyError}</p>}
      </div>
    </div>
  );
}
