import { useCallback, useEffect, useState } from "react";
import { partidaService } from "../services/api.js";
import { lerLocal, gravarLocal } from "../utils/armazenamento.js";

const CHAVE_PARTIDA = "palpitedti:partida";
const CHAVE_JOGADOR = "palpitedti:jogador";
export const CHAVE_ULTIMA_VITORIA = "palpitedti:ultima-vitoria";

/**
 * Toda a conversa da tela Jogar com a API de partidas.
 *
 * O id da partida fica no localStorage: dar F5 no meio do jogo não perde a rodada.
 * O número sorteado NÃO fica em lugar nenhum do navegador: a API não o envia.
 */
export function usePartida() {
  const [partida, setPartida] = useState(null);
  const [lance, setLance] = useState(null); // { palpite, mensagem, dica } do último palpite
  const [erro, setErro] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [restaurando, setRestaurando] = useState(() => Boolean(lerLocal(CHAVE_PARTIDA)));
  const [jogador, setJogador] = useState(() => lerLocal(CHAVE_JOGADOR) ?? "");

  const guardar = useCallback((nova) => {
    setPartida(nova);
    gravarLocal(CHAVE_PARTIDA, nova?.id ?? null);
    if (nova?.status === "VENCIDA") gravarLocal(CHAVE_ULTIMA_VITORIA, nova.id);
  }, []);

  // Voltou para a página? Retoma a partida que estava aberta.
  useEffect(() => {
    const id = lerLocal(CHAVE_PARTIDA);
    if (!id) return;
    partidaService
      .buscar(id)
      .then(setPartida)
      .catch(() => gravarLocal(CHAVE_PARTIDA, null)) // apagada no banco: começa do zero
      .finally(() => setRestaurando(false));
  }, []);

  const executar = useCallback(async (acao) => {
    setOcupado(true);
    setErro(null);
    try {
      return await acao();
    } catch (e) {
      setErro(e);
      throw e;
    } finally {
      setOcupado(false);
    }
  }, []);

  const iniciar = useCallback(
    (nome) =>
      executar(async () => {
        const limpo = (nome ?? "").trim();
        setJogador(limpo);
        gravarLocal(CHAVE_JOGADOR, limpo || null);
        setLance(null);
        guardar(await partidaService.iniciar(limpo || undefined));
      }),
    [executar, guardar],
  );

  const palpitar = useCallback(
    (numero) =>
      executar(async () => {
        try {
          const resultado = await partidaService.palpitar(partida.id, numero);
          setLance({ palpite: resultado.palpite, mensagem: resultado.mensagem, dica: resultado.dica });
          guardar(resultado.partida);
          return resultado;
        } catch (e) {
          // 409: a partida acabou em outra aba; 404: o banco foi reiniciado
          if (e.status === 409 || e.status === 404) {
            partidaService.buscar(partida.id).then(guardar).catch(() => guardar(null));
          }
          throw e;
        }
      }),
    [executar, guardar, partida],
  );

  const desistir = useCallback(
    () =>
      executar(async () => {
        setLance(null);
        guardar(await partidaService.desistir(partida.id));
      }),
    [executar, guardar, partida],
  );

  /** Volta para a tela de nome (trocar de jogador). */
  const sair = useCallback(() => {
    setLance(null);
    setErro(null);
    guardar(null);
  }, [guardar]);

  return { partida, lance, erro, ocupado, restaurando, jogador, iniciar, palpitar, desistir, sair };
}
