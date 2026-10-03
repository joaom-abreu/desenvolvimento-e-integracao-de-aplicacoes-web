import { useCallback, useMemo, useState } from "react";
import { AuthContext, SESSION_STORAGE_KEY } from "./authContext";
import { authenticate } from "../services/userService";

// Lê a sessão salva; sem sessão (ou sem sessionStorage) começa deslogado
const readStoredSession = () => {
  try {
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(readStoredSession);

  // Retorna true se o login deu certo
  const login = useCallback(async (username, senha) => {
    const user = await authenticate(username, senha);

    if (!user) {
      return false;
    }

    // Na sessão vão só os dados públicos (nada de senha)
    const sessao = { nome: user.nome, email: user.email };

    setUsuario(sessao);

    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessao));
    } catch {
      /* navegação privada: a sessão vale só enquanto a página estiver aberta */
    }

    return true;
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);

    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* nada para limpar */
    }
  }, []);

  const value = useMemo(
    () => ({ usuario, login, logout }),
    [usuario, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
