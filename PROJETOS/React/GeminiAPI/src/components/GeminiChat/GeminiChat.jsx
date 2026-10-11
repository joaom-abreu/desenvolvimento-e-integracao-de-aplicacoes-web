import { useEffect, useRef, useState } from "react";
import { FiRefreshCw, FiSend, FiSquare } from "react-icons/fi";
import { SiGooglegemini } from "react-icons/si";
import GEMINI_CONFIG from "../../config/geminiConfig";
import { askGemini } from "../../services/geminiService";
import MarkdownText from "./MarkdownText";
import "./GeminiChat.css";

/**
 * Chat "Pergunte sobre mim" com o Gemini.
 * As respostas aparecem em streaming (palavra por palavra).
 *
 * Para usar no seu projeto, copie:
 *   • a pasta components/GeminiChat
 *   • services/geminiService.js e config/geminiConfig.js
 *   • api/_gemini.js, api/_perfil.js, api/gemini.js e o plugin do vite.config.js
 *
 * <GeminiChat />
 */

const { ASSISTANT_NAME, WELCOME, SUGGESTIONS, MAX_MESSAGE } = GEMINI_CONFIG;

const ERROR_HINTS = {
  missing_key: "Crie o .env.local com a GEMINI_API_KEY (veja o README) e reinicie o npm run dev.",
  invalid_key: "Gere uma nova chave em aistudio.google.com/apikey.",
  model_not_found: "Confira o nome do modelo no GEMINI_MODEL.",
  no_api: "As funções da pasta api/ só rodam no npm run dev ou na Vercel.",
};

let nextId = 1;
const newMessage = (role, text, extra = {}) => ({ id: nextId++, role, text, ...extra });

export default function GeminiChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const abortRef = useRef(null);
  const inputRef = useRef(null);

  // Rola para a última mensagem sempre que algo muda
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  // Cancela a resposta em andamento se o componente sair da tela
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text) => {
    const question = text.trim();
    if (!question || loading) return;

    // Histórico que vai junto: só mensagens completas, sem erros
    const history = messages
      .filter((m) => !m.error && !m.streaming)
      .map((m) => ({ role: m.role, text: m.text }));

    const answer = newMessage("model", "", { streaming: true });
    setMessages((list) => [...list, newMessage("user", question), answer]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const update = (patch) =>
      setMessages((list) => list.map((m) => (m.id === answer.id ? { ...m, ...patch } : m)));

    try {
      await askGemini(question, {
        history,
        signal: controller.signal,
        onChunk: (partial) => update({ text: partial }),
      });
      update({ streaming: false });
    } catch (error) {
      if (error?.name === "AbortError") {
        update({ streaming: false, stopped: true });
      } else {
        update({
          streaming: false,
          error: true,
          text: error.message,
          hint: ERROR_HINTS[error.code] ?? (error.retryAfter ? `Tente de novo em ${error.retryAfter} s.` : null),
        });
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    send(input);
  };

  // Enter envia; Shift+Enter quebra a linha
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(input);
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
  };

  return (
    <section className="gemini-chat" aria-label={`Chat com ${ASSISTANT_NAME}`}>
      {/* ---------- Cabeçalho ---------- */}
      <header className="gemini-chat-header">
        <div className="gemini-chat-title">
          <span className="gemini-chat-avatar" aria-hidden="true">
            <SiGooglegemini />
          </span>
          <div>
            <strong>Pergunte para {ASSISTANT_NAME}</strong>
            <span className="gemini-chat-status">
              <span className={loading ? "dot typing" : "dot"} aria-hidden="true" />
              {loading ? "digitando..." : "respostas geradas pelo Gemini"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="gemini-chat-reset"
          onClick={reset}
          disabled={messages.length === 0}
          title="Nova conversa"
        >
          <FiRefreshCw aria-hidden="true" /> Nova conversa
        </button>
      </header>

      {/* ---------- Mensagens ---------- */}
      <div className="gemini-chat-messages" ref={listRef} aria-live="polite">
        <div className="gemini-msg model">
          <div className="gemini-bubble">
            <p>{WELCOME}</p>
          </div>
        </div>

        {messages.map((m) => (
          <div key={m.id} className={`gemini-msg ${m.role}${m.error ? " error" : ""}`}>
            <div className="gemini-bubble">
              {m.role === "model" && !m.error ? (
                m.text ? (
                  <MarkdownText text={m.text} />
                ) : (
                  <span className="gemini-typing" aria-label="digitando">
                    <span />
                    <span />
                    <span />
                  </span>
                )
              ) : (
                <p>{m.text}</p>
              )}
              {m.hint && <small>{m.hint}</small>}
              {m.stopped && <small>Resposta interrompida.</small>}
            </div>
          </div>
        ))}

        {/* Perguntas prontas enquanto a conversa não começou */}
        {messages.length === 0 && (
          <div className="gemini-suggestions">
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => send(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Caixa de texto ---------- */}
      <form className="gemini-chat-form" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE))}
          onKeyDown={handleKeyDown}
          placeholder="Escreva sua pergunta..."
          rows={1}
          aria-label="Sua pergunta"
        />

        {loading ? (
          <button type="button" className="gemini-stop" onClick={() => abortRef.current?.abort()} title="Parar">
            <FiSquare aria-hidden="true" />
            <span className="sr-only">Parar</span>
          </button>
        ) : (
          <button type="submit" disabled={!input.trim()} title="Enviar">
            <FiSend aria-hidden="true" />
            <span className="sr-only">Enviar</span>
          </button>
        )}
      </form>

      <p className="gemini-chat-disclaimer">
        A IA pode errar. As respostas se baseiam no perfil escrito em <code>api/_perfil.js</code>.
      </p>
    </section>
  );
}
