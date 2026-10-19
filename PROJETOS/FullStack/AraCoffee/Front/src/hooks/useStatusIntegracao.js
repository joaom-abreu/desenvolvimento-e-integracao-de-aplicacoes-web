import { useEffect, useState } from "react";
import { verificarStatus } from "../services/statusService";

/** De quanto em quanto tempo tentamos falar com o back-end enquanto ele não responde */
const INTERVALO_STATUS_MS = 5000;

/**
 * O back-end está no ar? E o MongoDB?
 * Enquanto algo não responder, tenta de novo a cada 5 s.
 *
 * Útil com o "npm run dev:all": o Vite sobe em 1 s, mas o Spring Boot leva
 * alguns segundos para iniciar (e o Render, no plano gratuito, até 1 minuto).
 */
export function useStatusIntegracao() {
  const [status, setStatus] = useState({ backend: "verificando", mongodb: "desconhecido" });

  useEffect(() => {
    let ativo = true;
    let timer;

    const verificar = async () => {
      const novoStatus = await verificarStatus();

      if (!ativo) return;

      setStatus(novoStatus);

      if (novoStatus.backend !== "online" || novoStatus.mongodb !== "online") {
        timer = setTimeout(verificar, INTERVALO_STATUS_MS);
      }
    };

    verificar();

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, []);

  const conectado = status.backend === "online" && status.mongodb === "online";

  return { status, conectado };
}
