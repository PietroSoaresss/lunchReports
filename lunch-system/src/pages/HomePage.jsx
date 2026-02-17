import { useCallback, useEffect, useRef, useState } from "react";
import { registerLunch } from "../services/lunchService";

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

  useEffect(() => {
    inputRef.current?.focus();
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
          message: `Almoco registrado! ${data.employeeName}`
        });
        setHistory((prev) =>
          [{ ...data, time: new Date().toLocaleTimeString("pt-BR") }, ...prev].slice(0, 10)
        );
      } else if (data.status === "ALREADY_REGISTERED") {
        const time = data.registeredAt
          ? new Date(data.registeredAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit"
            })
          : "";

        setFeedback({
          type: "warning",
          message: `Voce ja registrou hoje as ${time}`
        });
      } else if (data.status === "NOT_FOUND") {
        setFeedback({ type: "error", message: "Funcionario nao encontrado" });
      } else if (data.status === "INACTIVE") {
        setFeedback({ type: "inactive", message: "Funcionario inativo" });
      } else {
        setFeedback({ type: "error", message: "Resposta inesperada do servidor." });
      }
    } catch (error) {
      setFeedback({ type: "error", message: "Erro de comunicacao com o servidor." });
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
      <h1 className="mb-8 text-3xl font-bold">Registrar Almoco</h1>

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
          placeholder="Digite ou escaneie o codigo..."
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

      {history.length > 0 && (
        <div className="mt-8 w-full">
          <h2 className="mb-2 text-sm font-semibold text-slate-500">Registros desta sessao</h2>
          <ul className="space-y-1">
            {history.map((item, index) => (
              <li
                key={`${item.employeeCode}-${index}`}
                className="flex justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm"
              >
                <span>{item.employeeName}</span>
                <span className="text-slate-400">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
