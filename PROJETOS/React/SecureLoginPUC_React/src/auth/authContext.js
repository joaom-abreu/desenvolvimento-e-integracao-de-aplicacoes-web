import { createContext, useContext } from "react";

// Chave da sessão no sessionStorage (fechou a aba, saiu do sistema)
export const SESSION_STORAGE_KEY = "puc-session";

export const AuthContext = createContext({
  usuario: null,
  login: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);
