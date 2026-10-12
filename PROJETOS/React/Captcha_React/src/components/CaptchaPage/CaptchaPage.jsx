import { Link } from "react-router-dom";
import PageLayout from "../PageLayout/PageLayout";
import "./CaptchaPage.css";

/**
 * Página de demonstração de um captcha (não faz parte de nenhum captcha,
 * não precisa copiar). À esquerda o formulário; à direita o painel
 * "Para usar no seu projeto".
 *
 * <CaptchaPage icon={SiCloudflare} brand="Turnstile" title="..." description="..."
 *              uso={{ arquivos, jsx, env, campo, chaves, nota }}>
 *   <FormularioContato ...>...</FormularioContato>
 * </CaptchaPage>
 */
const CaptchaPage = ({ icon, brand, title, description, aviso, uso, children }) => (
  <PageLayout icon={icon} brand={brand} title={title} description={description}>
    <title>{`${title} | Projeto Captcha`}</title>

    <div className="pagina-captcha">
      <section className="demo" aria-label="Demonstração">
        <Link className="voltar" to="/">
          ← Todos os captchas
        </Link>

        {aviso && <p className="captcha-aviso">{aviso}</p>}

        {children}
      </section>

      <aside className="copiar" aria-labelledby="titulo-copiar">
        <h2 id="titulo-copiar">Para usar no seu projeto</h2>

        <h3>Arquivos</h3>
        <ul className="arquivos">
          {uso.arquivos.map(([caminho, observacao]) => (
            <li key={caminho}>
              <code>{caminho}</code> {observacao && <span>({observacao})</span>}
            </li>
          ))}
        </ul>

        <h3>No componente (JSX)</h3>
        <pre>
          <code>{uso.jsx}</code>
        </pre>

        <h3>No .env.local</h3>
        {uso.env ? (
          <pre>
            <code>{uso.env}</code>
          </pre>
        ) : (
          <p>Nada. Este captcha não usa chave de provedor.</p>
        )}

        <h3>Campo que chega no POST</h3>
        <p>
          {uso.campo.map((campo, i) => (
            <span key={campo}>
              {i > 0 && " + "}
              <code>{campo}</code>
            </span>
          ))}
        </p>

        <h3>Onde conseguir as chaves</h3>
        <p>{uso.chaves}</p>

        {uso.nota && <p className="nota">{uso.nota}</p>}
      </aside>
    </div>
  </PageLayout>
);

export default CaptchaPage;
