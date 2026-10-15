import { useCallback, useEffect, useState } from "react";
import AlunoForm from "./components/AlunoForm";
import AlunoList from "./components/AlunoList";
import IntegrationPanel from "./components/IntegrationPanel";
import Message from "./components/Message";
import { atualizarAluno, criarAluno, excluirAluno, listarAlunos } from "./services/alunoService";
import { verificarStatus } from "./services/statusService";
import "./App.css";

/** De quanto em quanto tempo tentamos falar com o back-end enquanto ele não responde */
const INTERVALO_STATUS_MS = 5000;

const App = () => {
  const [status, setStatus] = useState({ backend: "verificando", mongodb: "desconhecido" });
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");
  const [alunoEmEdicao, setAlunoEmEdicao] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const conectado = status.backend === "online" && status.mongodb === "online";

  /* =====================================================
     1) STATUS: o back-end está no ar? E o MongoDB?
     Enquanto algo não responder, tenta de novo a cada 5 s.
     Útil com o "npm run dev:all": o Vite sobe em 1 s, mas o
     Spring Boot leva alguns segundos para iniciar.
     ===================================================== */
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

  /* =====================================================
     2) LISTA: GET /api/alunos (com ou sem filtro por nome)
     ===================================================== */
  const carregarAlunos = useCallback(async (nome) => {
    setCarregando(true);

    try {
      setAlunos(await listarAlunos(nome));
    } catch (erro) {
      setMensagem({ type: "error", title: "Não foi possível carregar os alunos", texto: erro.message });
    } finally {
      setCarregando(false);
    }
  }, []);

  // Recarrega quando a conexão fica pronta e quando a busca muda
  // (espera 300 ms depois da última tecla para não chamar a API a cada letra)
  useEffect(() => {
    if (!conectado) return;

    const timer = setTimeout(() => carregarAlunos(busca), 300);
    return () => clearTimeout(timer);
  }, [conectado, busca, carregarAlunos]);

  // Some com a mensagem de sucesso depois de 4 s
  useEffect(() => {
    if (mensagem?.type !== "success") return;

    const timer = setTimeout(() => setMensagem(null), 4000);
    return () => clearTimeout(timer);
  }, [mensagem]);

  /* =====================================================
     3) SALVAR: POST (novo) ou PUT (edição)
     ===================================================== */
  const handleSalvar = async (dados) => {
    try {
      if (alunoEmEdicao) {
        await atualizarAluno(alunoEmEdicao.id, dados);
        setMensagem({ type: "success", title: "Alterações salvas." });
        setAlunoEmEdicao(null);
      } else {
        await criarAluno(dados);
        setMensagem({ type: "success", title: "Aluno cadastrado." });
      }

      await carregarAlunos(busca);
      return true;
    } catch (erro) {
      setMensagem({ type: "error", title: "Não foi possível salvar", texto: erro.message });
      return false;
    }
  };

  /* =====================================================
     4) EXCLUIR: DELETE /api/alunos/{id}
     ===================================================== */
  const handleExcluir = async (aluno) => {
    if (!window.confirm(`Excluir ${aluno.nome}? Esta ação apaga o registro do MongoDB.`)) {
      return;
    }

    try {
      await excluirAluno(aluno.id);

      if (alunoEmEdicao?.id === aluno.id) {
        setAlunoEmEdicao(null);
      }

      setMensagem({ type: "success", title: "Aluno excluído." });
      await carregarAlunos(busca);
    } catch (erro) {
      setMensagem({ type: "error", title: "Não foi possível excluir", texto: erro.message });
    }
  };

  const handleEditar = (aluno) => {
    setMensagem(null);
    setAlunoEmEdicao(aluno);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-container">
      <IntegrationPanel status={status} />

      <main className="app-content">
        <h1 className="app-title">Cadastro de alunos</h1>

        <p className="app-description">
          Exemplo de integração: este front-end em React envia os dados para uma API Spring Boot, que grava tudo no
          MongoDB Atlas.
        </p>

        {mensagem && (
          <Message type={mensagem.type} title={mensagem.title}>
            {mensagem.texto}
          </Message>
        )}

        <AlunoForm
          key={alunoEmEdicao?.id ?? "novo"}
          alunoEmEdicao={alunoEmEdicao}
          onSalvar={handleSalvar}
          onCancelar={() => setAlunoEmEdicao(null)}
          desabilitado={!conectado}
        />

        <div className="app-divider"></div>

        <AlunoList
          alunos={alunos}
          carregando={carregando && alunos.length === 0}
          busca={busca}
          onBuscaChange={setBusca}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
          idEmEdicao={alunoEmEdicao?.id}
          desabilitado={!conectado}
        />
      </main>
    </div>
  );
};

export default App;
