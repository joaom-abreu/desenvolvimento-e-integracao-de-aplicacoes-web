import { useCallback, useEffect, useRef, useState } from "react";
import { generateSubtitles, OperationCancelledError, PartialResultError } from "../../core";
import { fetchStatus } from "../../services/subtitlesClient";
import { formatTime } from "./format";

/**
 * Hook que gera as legendas e guarda o estado da tela:
 *
 *   status:   "idle" | "running" | "done" | "error" | "cancelled"
 *   result:   { fileName, duration, chunkCount, language, translated, cues, elapsed } | null
 *   log:      [{ id, time, message, level }]  — aba "Log de execução"
 *   message:  texto da barra de status
 *   progress: { current, total } | null       — null = barra indeterminada
 *   server:   { hasKey, model } | null        — null enquanto não sabe
 *
 * O processamento roda com async/await, então a página não trava; o botão
 * Cancelar usa um AbortController (e encerra o worker do ffmpeg.wasm).
 */
export default function useSubtitlesGenerator() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);
  const [message, setMessage] = useState("Pronto. Escolha um vídeo e clique em Gerar legenda.");
  const [progress, setProgress] = useState(null);
  const [server, setServer] = useState(null);

  const controllerRef = useRef(null);
  const logId = useRef(0);

  const addLog = useCallback((text, level = "info") => {
    logId.current += 1;
    const entry = { id: logId.current, time: formatTime(), message: text, level };
    setLog((current) => [...current, entry]);
  }, []);

  // Descobre se há chave no servidor (para a dica abaixo do formulário)
  useEffect(() => {
    const controller = new AbortController();
    fetchStatus(controller.signal)
      .then((s) => setServer(s))
      .catch((err) => {
        if (err?.name !== "AbortError") setServer({ hasKey: false, model: null, error: err.message });
      });
    return () => controller.abort();
  }, []);

  // Cancela o processamento se o componente sair da tela
  useEffect(() => () => controllerRef.current?.abort(), []);

  const finish = useCallback(
    (text, level, nextStatus) => {
      addLog(text, level);
      setMessage(text);
      setProgress(level === "success" ? { current: 1, total: 1 } : { current: 0, total: 1 });
      setStatus(nextStatus);
      controllerRef.current = null;
    },
    [addLog]
  );

  const start = useCallback(
    async (file, options) => {
      if (controllerRef.current || !file) return; // já está rodando
      const controller = new AbortController();
      controllerRef.current = controller;

      setStatus("running");
      setError(null);
      setProgress(null);
      setResult(null);
      addLog(`Iniciando: ${file.name}`);
      setMessage(`Iniciando: ${file.name}`);

      const onProgress = (event) => {
        if (!event.silent) addLog(event.message, event.level);
        setMessage(event.message);
        if (event.total) setProgress({ current: event.current ?? 0, total: event.total });
      };

      try {
        const subtitles = await generateSubtitles(file, {
          ...options,
          onProgress,
          signal: controller.signal,
        });
        setResult(subtitles);
        finish(
          `Legendas de ${subtitles.fileName} prontas às ${formatTime()} · ` +
            `${subtitles.cues.length} legenda(s).`,
          "success",
          "done"
        );
      } catch (err) {
        if (err instanceof OperationCancelledError || controller.signal.aborted) {
          finish("Geração cancelada.", "warning", "cancelled");
        } else if (err instanceof PartialResultError) {
          // Mostra o que ficou pronto: dá para revisar e baixar mesmo assim
          setResult(err.partial);
          setError(err.cause);
          finish(
            `Erro: ${err.message} (${err.partial.chunksDone} de ${err.partial.chunkCount} trechos prontos).`,
            "error",
            "error"
          );
        } else {
          setError(err);
          finish(`Erro: ${err.message}`, "error", "error");
        }
      }
    },
    [addLog, finish]
  );

  const cancel = useCallback(() => {
    if (controllerRef.current && !controllerRef.current.signal.aborted) {
      controllerRef.current.abort();
      setMessage("Cancelando…");
    }
  }, []);

  // Revisão: o usuário corrige o texto de uma legenda na tabela
  const updateCue = useCallback((id, text) => {
    setResult((current) =>
      current
        ? { ...current, cues: current.cues.map((cue) => (cue.id === id ? { ...cue, text } : cue)) }
        : current
    );
  }, []);

  // Outro vídeo escolhido: as legendas anteriores não valem mais
  const reset = useCallback((text) => {
    if (controllerRef.current) return;
    setResult(null);
    setError(null);
    setProgress(null);
    setStatus("idle");
    setMessage(text);
  }, []);

  return {
    status,
    running: status === "running",
    result,
    error,
    log,
    message,
    setMessage,
    progress,
    server,
    addLog,
    start,
    cancel,
    updateCue,
    reset,
  };
}
