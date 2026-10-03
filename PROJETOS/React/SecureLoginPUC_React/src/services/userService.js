import { readJSON, writeJSON } from "../utils/storage";
import { hashPassword } from "../utils/hash";

// Chave onde a lista de usuários fica salva no localStorage
const USERS_STORAGE_KEY = "puc-users";

// E-mail é o "username": sempre comparado sem espaços e em minúsculas
const normalizeEmail = (email) => email.trim().toLowerCase();

const getUsers = () => readJSON(USERS_STORAGE_KEY, []);

const saveUsers = (users) => writeJSON(USERS_STORAGE_KEY, users);

/**
 * Busca um usuário pelo e-mail. Retorna null se não existir.
 */
export function findByEmail(email) {
  const emailNormalizado = normalizeEmail(email);
  return getUsers().find((user) => user.email === emailNormalizado) ?? null;
}

/**
 * Verifica se já existe uma conta com o e-mail informado.
 */
export function exists(email) {
  return findByEmail(email) !== null;
}

/**
 * Cadastra um novo usuário. Retorna false se o e-mail já estiver em uso.
 */
export async function register({ nome, email, cpf, rg, endereco, instituicao, senha }) {
  if (exists(email)) {
    return false;
  }

  const novoUsuario = {
    nome: nome.trim(),
    email: normalizeEmail(email),
    cpf,
    rg: rg.trim(),
    endereco: endereco.trim(),
    instituicao: instituicao.trim(),
    senha: await hashPassword(senha), // nunca guardamos a senha pura
    criadoEm: new Date().toISOString(),
  };

  saveUsers([...getUsers(), novoUsuario]);

  return true;
}

/**
 * Confere usuário e senha. Retorna o usuário ou null se os dados estiverem errados.
 */
export async function authenticate(username, senha) {
  const user = findByEmail(username);

  if (!user) {
    return null;
  }

  const hash = await hashPassword(senha);

  return user.senha === hash ? user : null;
}

/**
 * Troca a senha do usuário (usado na redefinição de senha).
 */
export async function updatePassword(email, novaSenha) {
  const emailNormalizado = normalizeEmail(email);
  const hash = await hashPassword(novaSenha);

  const users = getUsers().map((user) =>
    user.email === emailNormalizado ? { ...user, senha: hash } : user
  );

  saveUsers(users);
}

/**
 * Primeiro nome do usuário, usado no "Olá, Joao!" do e-mail e da home.
 */
export function getFirstName(user) {
  return user?.nome?.split(" ")[0] || user?.email || "";
}
