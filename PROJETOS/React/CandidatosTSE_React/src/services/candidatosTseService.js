import Papa from "papaparse";
import fotosDisponiveis from "virtual:fotos-candidatos";
import Candidato from "../model/Candidato";

/**
 * Lê o CSV do TSE (consulta_cand_2026_MG.csv) uma única vez e mantém a lista
 * de candidatos em memória para filtragem simples.
 *
 * O arquivo do TSE:
 * - separador: ";"
 * - aspas: "\""
 * - charset: ISO-8859-1 (Latin-1)
 *
 * Mesma lógica do CandidatosTseService.java do projeto Spring Boot. A diferença
 * é que aqui quem lê o CSV é o navegador (fetch), e não o servidor.
 */

const CAMINHO_CSV = `${import.meta.env.BASE_URL}data/candidatos/consulta_cand_2026_MG.csv`;

/** Pasta pública das fotos (public/images/candidatos/ depois de descompactar o images.zip). */
export const PASTA_IMAGENS_CANDIDATOS = `${import.meta.env.BASE_URL}images/candidatos/`;

/** Foto usada quando o candidato não tem foto (vem dentro do images.zip). */
export const FOTO_PADRAO = "sem-foto.jpg";

// índices das colunas no CSV (posição 0-based no header)
const COL_SG_UF = 10;
const COL_NM_UE = 12;
const COL_DS_CARGO = 14;
const COL_SQ_CANDIDATO = 15;
const COL_NR_CANDIDATO = 16;
const COL_NM_CANDIDATO = 17;
const COL_NM_URNA_CANDIDATO = 18;
const COL_DS_SITUACAO_CANDIDATURA = 23;
const COL_SG_PARTIDO = 26;
const COL_NM_PARTIDO = 27;
const COL_DT_NASCIMENTO = 36;
const COL_DS_GENERO = 39;
const COL_DS_GRAU_INSTRUCAO = 41;
const COL_DS_OCUPACAO = 47;
const COL_NR_CPF_CANDIDATO = 20;

const MIN_COLUNAS = 48;

/** Arquivos que existem em public/images/candidatos/ (lista montada pelo vite.config.js). */
const FOTOS_NO_DISCO = new Set(fotosDisponiveis);

let candidatos = [];
let carregamento = null;

/**
 * Lê o CSV uma única vez (o equivalente ao @PostConstruct do Spring).
 * Chamadas seguintes devolvem a mesma Promise, sem baixar o arquivo de novo.
 */
export function carregarCsv() {
  if (!carregamento) {
    carregamento = lerCsv().catch((erro) => {
      carregamento = null; // permite tentar de novo
      throw erro;
    });
  }
  return carregamento;
}

async function lerCsv() {
  const resposta = await fetch(CAMINHO_CSV);
  if (!resposta.ok) {
    throw new Error(`Erro ao ler o CSV de candidatos: ${CAMINHO_CSV} (HTTP ${resposta.status})`);
  }

  // O CSV do TSE vem em ISO-8859-1. O resposta.text() leria como UTF-8 e
  // estragaria os acentos, então decodificamos os bytes na mão.
  const bytes = await resposta.arrayBuffer();
  const texto = new TextDecoder("iso-8859-1").decode(bytes);

  const { data: linhas } = Papa.parse(texto, {
    delimiter: ";",
    quoteChar: '"',
    skipEmptyLines: true,
  });

  const lista = [];
  for (const linha of linhas.slice(1)) { // pula o cabeçalho
    if (linha.length < MIN_COLUNAS) {
      continue;
    }
    const c = new Candidato();
    c.uf = valor(linha, COL_SG_UF);
    c.municipio = valor(linha, COL_NM_UE);
    c.cargo = valor(linha, COL_DS_CARGO);
    c.sqCandidato = valor(linha, COL_SQ_CANDIDATO);
    c.nrCandidato = valor(linha, COL_NR_CANDIDATO);
    c.nomeCandidato = valor(linha, COL_NM_CANDIDATO);
    c.nomeUrna = valor(linha, COL_NM_URNA_CANDIDATO);
    c.situacaoCandidatura = valor(linha, COL_DS_SITUACAO_CANDIDATURA);
    c.siglaPartido = valor(linha, COL_SG_PARTIDO);
    c.nomePartido = valor(linha, COL_NM_PARTIDO);
    c.dtNascimento = valor(linha, COL_DT_NASCIMENTO);
    c.genero = valor(linha, COL_DS_GENERO);
    c.grauInstrucao = valor(linha, COL_DS_GRAU_INSTRUCAO);
    c.ocupacao = valor(linha, COL_DS_OCUPACAO);
    c.nrCpfCandidato = valor(linha, COL_NR_CPF_CANDIDATO);

    lista.push(c);
  }

  // Quando uma candidatura não tem foto própria, tenta usar a foto de
  // outra candidatura da mesma pessoa (mesmo nome + número). Comum em
  // Senador, onde titular e suplentes são registros separados no TSE.
  resolverFotosPorCpf(lista);

  // ordena por nome de urna, só para ficar mais agradável na tela
  lista.sort((a, b) => comparar(a.nomeUrna, b.nomeUrna));

  candidatos = lista;
  return candidatos;
}

/**
 * Agrupa os candidatos por "nome civil + número de candidato" e, para quem
 * não tem foto própria disponível no disco, aponta para a foto de outra
 * candidatura da mesma pessoa (se existir).
 *
 * OBS: usamos nome+número em vez do CPF porque o TSE mascara o CPF (vira "-4")
 * em algumas candidaturas (tipicamente a linha do "titular" de Senador),
 * enquanto as linhas de suplente mantêm o CPF real. Nome civil completo e
 * número do candidato continuam preenchidos e iguais entre titular/suplentes.
 */
function resolverFotosPorCpf(lista) {
  const porPessoa = new Map();

  for (const c of lista) {
    if (!c.nomeCandidato || !c.nrCandidato) {
      continue;
    }
    const chave = `${c.nomeCandidato.trim().toLocaleUpperCase("pt-BR")}|${c.nrCandidato.trim()}`;
    if (!porPessoa.has(chave)) {
      porPessoa.set(chave, []);
    }
    porPessoa.get(chave).push(c);
  }

  for (const grupo of porPessoa.values()) {
    if (grupo.length < 2) {
      continue; // só uma candidatura para essa pessoa, nada a fazer
    }

    const comFoto = grupo.find((c) => fotoExisteNoDisco(c.sqCandidato));
    if (!comFoto) {
      continue; // ninguém do grupo tem foto disponível, não há o que emprestar
    }

    for (const c of grupo) {
      if (!fotoExisteNoDisco(c.sqCandidato)) {
        c.sqCandidatoParaFoto = comFoto.sqCandidato;
      }
    }
  }
}

/**
 * Verifica se o arquivo FMG<sqCandidato>_div.jpg realmente existe em
 * public/images/candidatos/.
 */
function fotoExisteNoDisco(sqCandidato) {
  return FOTOS_NO_DISCO.has(`FMG${sqCandidato}_div.jpg`);
}

/**
 * Endereço da foto do candidato. Se o arquivo não existe, usa a sem-foto.jpg;
 * se nem ela existe (images.zip não descompactado), devolve null e o card
 * mostra o texto "Sem foto".
 */
export function urlFoto(candidato) {
  if (FOTOS_NO_DISCO.has(candidato.nomeArquivoFoto)) {
    return PASTA_IMAGENS_CANDIDATOS + candidato.nomeArquivoFoto;
  }
  if (FOTOS_NO_DISCO.has(FOTO_PADRAO)) {
    return PASTA_IMAGENS_CANDIDATOS + FOTO_PADRAO;
  }
  return null;
}

function valor(linha, indice) {
  if (indice >= linha.length) {
    return "";
  }
  const v = linha[indice];
  return v == null ? "" : String(v).trim();
}

/** Mesma ordem do String.compareTo do Java (sem regras de idioma). */
function comparar(a, b) {
  if (a === b) return 0;
  if (!a) return 1; // nullsLast
  if (!b) return -1;
  return a < b ? -1 : 1;
}

export function listarTodos() {
  return candidatos;
}

/**
 * Filtro simples: qualquer parâmetro nulo/vazio é ignorado.
 * A busca textual (texto) procura em nome, nome de urna e número do candidato.
 */
export function filtrar(cargo, partido, texto) {
  const textoBusca = normalizar(texto);

  return candidatos
    .filter((c) => vazioOuIgual(cargo, c.cargo))
    .filter((c) => vazioOuIgual(partido, c.siglaPartido))
    .filter((c) => textoBusca === "" || contemTexto(c, textoBusca));
}

function vazioOuIgual(filtro, valorCandidato) {
  return (
    filtro == null ||
    filtro.trim() === "" ||
    filtro.toLocaleUpperCase("pt-BR") === (valorCandidato ?? "").toLocaleUpperCase("pt-BR")
  );
}

function contemTexto(c, textoBusca) {
  return (
    normalizar(c.nomeCandidato).includes(textoBusca) ||
    normalizar(c.nomeUrna).includes(textoBusca) ||
    normalizar(c.nrCandidato).includes(textoBusca)
  );
}

function normalizar(s) {
  return s == null ? "" : s.trim().toLocaleLowerCase("pt-BR");
}

/** Valores distintos e ordenados (o TreeSet do Java), sem vazios. */
function distintos(valores) {
  return [...new Set(valores.filter((s) => s && s.trim() !== ""))].sort(comparar);
}

/** Lista de cargos distintos (ordenada) para popular o <select> do filtro. */
export function listarCargos() {
  return distintos(candidatos.map((c) => c.cargo));
}

/** Lista de partidos distintos (siglas) para popular o <select> do filtro. */
export function listarPartidos() {
  return distintos(candidatos.map((c) => c.siglaPartido));
}
