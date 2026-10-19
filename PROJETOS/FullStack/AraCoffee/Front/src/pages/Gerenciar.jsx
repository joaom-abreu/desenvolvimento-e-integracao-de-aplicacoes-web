import { useCallback, useEffect, useState } from "react";
import bannerGerenciar from "../assets/images/banner-gerenciar.webp";
import Banner from "../components/Banner";
import IntegrationPanel from "../components/IntegrationPanel";
import Message from "../components/Message";
import ProdutoForm from "../components/ProdutoForm";
import ProdutoList from "../components/ProdutoList";
import { atualizarProduto, criarProduto, excluirProduto, listarCategorias, listarProdutos } from "../services/produtoService";
import "./Gerenciar.css";

/**
 * Área da equipe: CRUD completo do cardápio.
 * Cada botão vira uma requisição para o ProdutoController do Spring Boot.
 */
const Gerenciar = ({ status, conectado }) => {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  /* =====================================================
     1) LISTA: GET /api/produtos (com ou sem filtro por nome)
     ===================================================== */
  const carregarProdutos = useCallback(async (nome) => {
    setCarregando(true);

    try {
      setProdutos(await listarProdutos({ nome }));
    } catch (erro) {
      setMensagem({ type: "error", title: "Não foi possível carregar o cardápio", texto: erro.message });
    } finally {
      setCarregando(false);
    }
  }, []);

  // Categorias para o <select> do formulário: GET /api/produtos/categorias
  useEffect(() => {
    if (!conectado) return;
    listarCategorias()
      .then(setCategorias)
      .catch((erro) => setMensagem({ type: "error", title: "Não foi possível carregar as categorias", texto: erro.message }));
  }, [conectado]);

  // Recarrega quando a conexão fica pronta e quando a busca muda (300 ms depois da última tecla)
  useEffect(() => {
    if (!conectado) return;

    const timer = setTimeout(() => carregarProdutos(busca), 300);
    return () => clearTimeout(timer);
  }, [conectado, busca, carregarProdutos]);

  // Some com a mensagem de sucesso depois de 4 s
  useEffect(() => {
    if (mensagem?.type !== "success") return;

    const timer = setTimeout(() => setMensagem(null), 4000);
    return () => clearTimeout(timer);
  }, [mensagem]);

  /* =====================================================
     2) SALVAR: POST (novo) ou PUT (edição)
     ===================================================== */
  const handleSalvar = async (dados) => {
    try {
      if (produtoEmEdicao) {
        await atualizarProduto(produtoEmEdicao.id, dados);
        setMensagem({ type: "success", title: "Alterações salvas." });
        setProdutoEmEdicao(null);
      } else {
        await criarProduto(dados);
        setMensagem({ type: "success", title: `${dados.nome.trim()} adicionado ao cardápio.` });
      }

      await carregarProdutos(busca);
      return true;
    } catch (erro) {
      setMensagem({ type: "error", title: "Não foi possível salvar", texto: erro.message });
      return false;
    }
  };

  /* =====================================================
     3) EXCLUIR: DELETE /api/produtos/{id}
     ===================================================== */
  const handleExcluir = async (produto) => {
    if (!window.confirm(`Excluir ${produto.nome}? Esta ação apaga o produto do MongoDB.`)) {
      return;
    }

    try {
      await excluirProduto(produto.id);

      if (produtoEmEdicao?.id === produto.id) {
        setProdutoEmEdicao(null);
      }

      setMensagem({ type: "success", title: `${produto.nome} excluído do cardápio.` });
      await carregarProdutos(busca);
    } catch (erro) {
      setMensagem({ type: "error", title: "Não foi possível excluir", texto: erro.message });
    }
  };

  const handleEditar = (produto) => {
    setMensagem(null);
    setProdutoEmEdicao(produto);
    document.getElementById("formulario-produto")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Banner imagem={bannerGerenciar} titulo="Gerenciar cardápio">
        O que você salvar aqui vai para a API Spring Boot, é gravado no MongoDB Atlas e aparece na hora no cardápio do
        site.
      </Banner>

      <div className="container gerenciar">
      <IntegrationPanel status={status} />

      {mensagem && (
        <Message type={mensagem.type} title={mensagem.title}>
          {mensagem.texto}
        </Message>
      )}

      <div className="gerenciar-colunas">
        <div id="formulario-produto" className="gerenciar-formulario">
          <ProdutoForm
            key={produtoEmEdicao?.id ?? "novo"}
            produtoEmEdicao={produtoEmEdicao}
            categorias={categorias}
            onSalvar={handleSalvar}
            onCancelar={() => setProdutoEmEdicao(null)}
            desabilitado={!conectado}
          />
        </div>

        <ProdutoList
          produtos={produtos}
          carregando={carregando && produtos.length === 0}
          busca={busca}
          onBuscaChange={setBusca}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
          idEmEdicao={produtoEmEdicao?.id}
          desabilitado={!conectado}
        />
      </div>
      </div>
    </>
  );
};

export default Gerenciar;
