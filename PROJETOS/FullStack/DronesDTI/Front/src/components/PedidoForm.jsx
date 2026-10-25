import { useState } from "react";
import Mensagem from "./Mensagem.jsx";
import { useSimulacao } from "../hooks/SimulacaoContext.jsx";

const INICIAL = { cliente: "", x: "", y: "", pesoKg: "", prioridade: "MEDIA" };

/** Converte "2,5" ou "2.5" em número (ou null se vazio/ inválido). */
export function paraNumero(texto) {
  if (texto === "" || texto === null || texto === undefined) return null;
  const n = Number(String(texto).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/**
 * Formulário de novo pedido. Valida o básico na tela (campos vazios e limites
 * da cidade) e deixa as regras de negócio (capacidade, alcance, zonas) para a API.
 */
export default function PedidoForm({ ponto, onCriar }) {
  const { cidade } = useSimulacao();
  const [valores, setValores] = useState(INICIAL);
  const [errosCampos, setErrosCampos] = useState({});
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // o clique no mapa preenche x e y
  const [ultimoPonto, setUltimoPonto] = useState(null);
  if (ponto && ponto !== ultimoPonto) {
    setUltimoPonto(ponto);
    setValores((v) => ({ ...v, x: String(ponto.x).replace(".", ","), y: String(ponto.y).replace(".", ",") }));
  }

  const alterar = (campo) => (e) => setValores((v) => ({ ...v, [campo]: e.target.value }));

  function validar() {
    const erros = {};
    const x = paraNumero(valores.x);
    const y = paraNumero(valores.y);
    const peso = paraNumero(valores.pesoKg);
    if (x === null) erros.x = "Informe x.";
    else if (x < 0 || x > cidade.larguraKm) erros.x = `Entre 0 e ${cidade.larguraKm}.`;
    if (y === null) erros.y = "Informe y.";
    else if (y < 0 || y > cidade.alturaKm) erros.y = `Entre 0 e ${cidade.alturaKm}.`;
    if (peso === null) erros.pesoKg = "Informe o peso.";
    else if (peso <= 0) erros.pesoKg = "Maior que zero.";
    return erros;
  }

  async function enviar(e) {
    e.preventDefault();
    setMensagem(null);
    const erros = validar();
    setErrosCampos(erros);
    if (Object.keys(erros).length) return;

    setEnviando(true);
    try {
      const criado = await onCriar({
        cliente: valores.cliente.trim(),
        x: paraNumero(valores.x),
        y: paraNumero(valores.y),
        pesoKg: paraNumero(valores.pesoKg),
        prioridade: valores.prioridade,
      });
      setMensagem({ tipo: "sucesso", texto: `Pedido de ${criado.cliente} entrou na fila.` });
      setValores(INICIAL);
    } catch (erro) {
      setErrosCampos(erro.campos || {});
      setMensagem({ tipo: "erro", texto: erro.message });
    } finally {
      setEnviando(false);
    }
  }

  const campo = (nome, rotulo, props = {}) => (
    <div className="campo" data-invalido={Boolean(errosCampos[nome])}>
      <label htmlFor={`pedido-${nome}`}>{rotulo}</label>
      <input id={`pedido-${nome}`} value={valores[nome]} onChange={alterar(nome)} {...props} />
      {errosCampos[nome] && <span className="erro-campo">{errosCampos[nome]}</span>}
    </div>
  );

  return (
    <form className="formulario" onSubmit={enviar} noValidate aria-label="Novo pedido">
      {campo("cliente", "Cliente", { placeholder: "Nome de quem recebe", maxLength: 60 })}
      <div className="linha-campos">
        {campo("x", "x (km)", { inputMode: "decimal", placeholder: "0 a 20" })}
        {campo("y", "y (km)", { inputMode: "decimal", placeholder: "0 a 20" })}
        {campo("pesoKg", "Peso (kg)", { inputMode: "decimal", placeholder: "ex.: 2,5" })}
      </div>
      <fieldset className="campo" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 500, fontSize: "0.875rem", marginBottom: 4 }}>Prioridade</legend>
        <div className="seletor-prioridade">
          {[
            ["BAIXA", "Baixa"],
            ["MEDIA", "Média"],
            ["ALTA", "Alta"],
          ].map(([valor, texto]) => (
            <label key={valor}>
              <input
                type="radio"
                name="prioridade"
                value={valor}
                checked={valores.prioridade === valor}
                onChange={alterar("prioridade")}
              />
              {texto}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="botao" disabled={enviando}>
        {enviando ? "Enviando…" : "Adicionar à fila"}
      </button>
      {mensagem && <Mensagem tipo={mensagem.tipo}>{mensagem.texto}</Mensagem>}
    </form>
  );
}
