import { Link } from "react-router-dom";
import { TbRobot } from "react-icons/tb";
import PageLayout from "../components/PageLayout/PageLayout";
import robo from "../assets/images/robo.svg";
import "./Home.css";

// Linhas da tabela comparativa (mesma do projeto Spring Boot)
const CAPTCHAS = [
  ["/recaptcha-v2-checkbox", "reCAPTCHA v2 checkbox", "Marca a caixa; às vezes escolhe imagens", "Google", "Não", "alto"],
  ["/recaptcha-v2-invisivel", "reCAPTCHA v2 invisível", "Só clica em enviar; imagens se houver suspeita", "Google", "Não", "alto"],
  ["/recaptcha-v3", "reCAPTCHA v3", "Nada; o servidor recebe uma nota", "Google", "Não", "alto"],
  ["/hcaptcha", "hCaptcha", "Marca a caixa; às vezes escolhe imagens", "hCaptcha", "Não", "alto"],
  ["/turnstile", "Cloudflare Turnstile", "Normalmente nada; às vezes um clique", "Cloudflare", "Não", "alto"],
  ["/altcha", "ALTCHA", "Marca a caixa; o navegador calcula", "Nenhum", "Sim (widget do npm)", "medio"],
  ["/captcha-imagem", "Captcha de imagem", "Digita as letras da imagem", "Nenhum", "Sim", "medio"],
  ["/captcha-matematico", "Captcha matemático", "Resolve uma conta", "Nenhum", "Sim", "baixo"],
];

const NIVEL = { alto: "Alta", medio: "Média", baixo: "Baixa" };

const Home = () => (
  <PageLayout
    icon={TbRobot}
    brand="Captcha"
    title="Oito jeitos de provar que não é um robô"
    description="Cada captcha abaixo está funcionando neste projeto. Abra, teste o formulário e, quando escolher o seu, copie o service, o componente e as variáveis listadas na própria página."
  >
    <title>Início | Projeto Captcha</title>

    <div className="home">
      {/* =====================================================
          COMO FUNCIONA
          ===================================================== */}
      <section className="abertura">
        <div>
          <h2>Como funciona</h2>
          <ol className="fluxo">
            <li>
              <strong>O React desenha o captcha.</strong> Cada widget é um componente em{" "}
              <code>src/components/captchas/</code>, com a <em>site key</em> (pública).
            </li>
            <li>
              <strong>O formulário envia o token.</strong> Nome, mensagem e o campo do captcha vão
              num <code>POST</code> para <code>/api/...</code>.
            </li>
            <li>
              <strong>O servidor confere.</strong> A pasta <code>api/</code> valida com a{" "}
              <em>secret key</em>, que nunca chega ao navegador, e responde Validado ou Bloqueado.
            </li>
          </ol>
        </div>
        <img className="abertura-robo" src={robo} alt="" width="440" height="390" />
      </section>

      {/* =====================================================
          TABELA COMPARATIVA
          ===================================================== */}
      <section aria-labelledby="titulo-tabela">
        <h2 id="titulo-tabela">Compare e escolha</h2>
        <div className="tabela-rolagem">
          <table className="comparativo">
            <thead>
              <tr>
                <th scope="col">Captcha</th>
                <th scope="col">O que a pessoa faz</th>
                <th scope="col">Cadastro</th>
                <th scope="col">Sem internet</th>
                <th scope="col">Contra robôs</th>
              </tr>
            </thead>
            <tbody>
              {CAPTCHAS.map(([rota, nome, acao, cadastro, offline, nivel]) => (
                <tr key={rota}>
                  <th scope="row">
                    <Link to={rota}>{nome}</Link>
                  </th>
                  <td>{acao}</td>
                  <td>{cadastro}</td>
                  <td>{offline}</td>
                  <td>
                    <span className={`nivel nivel-${nivel}`}>{NIVEL[nivel]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="nota">
          Os captchas com cadastro já vêm com as chaves de teste oficiais de cada empresa, então
          funcionam assim que o projeto sobe. A exceção é o reCAPTCHA v3, que exige uma chave real.
        </p>
      </section>

      {/* =====================================================
          PASSOS
          ===================================================== */}
      <section aria-labelledby="titulo-passos">
        <h2 id="titulo-passos">Levando para o seu projeto</h2>
        <ol className="passos">
          <li>
            <strong>Copie o service e a rota.</strong>
            Cada captcha tem um arquivo em <code>api/_services/</code> que faz toda a validação e uma
            rota em <code>api/</code> que recebe o formulário.
          </li>
          <li>
            <strong>Copie o componente.</strong>
            Os widgets ficam em <code>src/components/captchas/</code>. Coloque dentro do seu{" "}
            <code>&lt;form&gt;</code> e pegue o token com <code>obterDados()</code>.
          </li>
          <li>
            <strong>Copie as variáveis.</strong>
            Leve o bloco do <code>.env.example</code> para o seu <code>.env.local</code> e troque as
            chaves de teste pelas suas.
          </li>
          <li>
            <strong>Valide no servidor.</strong>
            Junte o plugin do <code>vite.config.js</code> (no <code>npm run dev</code>) e publique a
            pasta <code>api/</code> na Vercel. Validar só no front não protege nada.
          </li>
        </ol>
      </section>
    </div>
  </PageLayout>
);

export default Home;
