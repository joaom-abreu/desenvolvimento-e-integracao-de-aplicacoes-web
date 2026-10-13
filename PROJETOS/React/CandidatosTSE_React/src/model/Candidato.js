/**
 * Representa um candidato lido do arquivo consulta_cand_2026_MG.csv (TSE).
 * Somente os campos usados na tela estão mapeados; o CSV tem muitas outras colunas.
 *
 * Mesmos campos do Candidato.java do projeto Spring Boot. Os getters
 * getNomeArquivoFoto() e getIdade() viraram os "getters" do JavaScript
 * (nomeArquivoFoto e idade), lidos como propriedades: cand.idade.
 */
export default class Candidato {
  sqCandidato = ""; // SQ_CANDIDATO -> usado para achar a foto: FMG<SQ_CANDIDATO>_div.jpg
  nrCandidato = ""; // NR_CANDIDATO
  nomeCandidato = ""; // NM_CANDIDATO
  nomeUrna = ""; // NM_URNA_CANDIDATO
  cargo = ""; // DS_CARGO
  siglaPartido = ""; // SG_PARTIDO
  nomePartido = ""; // NM_PARTIDO
  uf = ""; // SG_UF
  municipio = ""; // NM_UE
  situacaoCandidatura = ""; // DS_SITUACAO_CANDIDATURA
  genero = ""; // DS_GENERO
  grauInstrucao = ""; // DS_GRAU_INSTRUCAO
  ocupacao = ""; // DS_OCUPACAO
  dtNascimento = ""; // DT_NASCIMENTO (formato dd/MM/yyyy)
  nrCpfCandidato = ""; // NR_CPF_CANDIDATO

  /**
   * Normalmente igual a sqCandidato. Só é diferente quando esta candidatura
   * específica não tem foto própria, mas outra candidatura da mesma pessoa
   * (ex.: titular/suplente de Senador) tem. Nesse caso apontamos para a foto
   * dela. Ver resolverFotosPorCpf() no candidatosTseService.js.
   */
  sqCandidatoParaFoto = null;

  /**
   * Nome do arquivo de foto conforme o padrão do TSE: FMG<SQ_CANDIDATO>_div.jpg
   * Ex.: SQ_CANDIDATO = 130002538303 -> FMG130002538303_div.jpg
   */
  get nomeArquivoFoto() {
    const sq = this.sqCandidatoParaFoto ?? this.sqCandidato;
    return `FMG${sq}_div.jpg`;
  }

  /**
   * Idade calculada a partir de DT_NASCIMENTO. Retorna -1 se a data vier
   * ausente/inválida (ex.: "#NULO"), para que a tela simplesmente não exiba nada.
   * Faz a mesma conta do Period.between(nascimento, hoje).getYears() do Java.
   */
  get idade() {
    const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(this.dtNascimento ?? "");
    if (!partes) {
      return -1;
    }
    const dia = Number(partes[1]);
    const mes = Number(partes[2]);
    const ano = Number(partes[3]);

    const nascimento = new Date(ano, mes - 1, dia);
    if (nascimento.getDate() !== dia || nascimento.getMonth() !== mes - 1) {
      return -1; // data impossível, ex.: 31/02/1980
    }

    const hoje = new Date();
    let anos = hoje.getFullYear() - ano;
    const aindaNaoFezAniversario =
      hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia);
    if (aindaNaoFezAniversario) {
      anos--;
    }
    return anos;
  }
}
