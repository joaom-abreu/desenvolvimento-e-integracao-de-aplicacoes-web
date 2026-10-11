import { FiAlertTriangle, FiExternalLink } from "react-icons/fi";

// Aparece no lugar do mapa enquanto o VITE_MAPBOX_TOKEN não estiver configurado
export default function TokenMissing() {
  return (
    <div className="map-token-missing" role="alert">
      <FiAlertTriangle className="map-token-icon" aria-hidden="true" />
      <h3>Configure o token do Mapbox</h3>
      <p>O mapa precisa de um token público do Mapbox para carregar.</p>

      <ol>
        <li>
          Crie sua conta em{" "}
          <a href="https://account.mapbox.com/auth/signup/" target="_blank" rel="noopener noreferrer">
            mapbox.com <FiExternalLink aria-hidden="true" />
          </a>{" "}
          usando o seu e-mail <strong>@pucminas.edu.br</strong> (acesso de estudante).
        </li>
        <li>
          Em <strong>Tokens</strong>, copie o <em>Default public token</em> (começa com <code>pk.</code>).
        </li>
        <li>
          Crie o arquivo <code>.env.local</code> na raiz do projeto com:
          <pre>VITE_MAPBOX_TOKEN=pk.seu_token_aqui</pre>
        </li>
        <li>
          Pare e rode de novo o <code>npm run dev</code>.
        </li>
      </ol>
    </div>
  );
}
