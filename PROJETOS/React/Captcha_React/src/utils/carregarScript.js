// Carrega o <script> de um provedor de captcha UMA vez só, mesmo que várias
// páginas (ou o StrictMode do React) peçam de novo.
//
// Os três provedores (Google, hCaptcha e Cloudflare) aceitam os parâmetros
// ?onload=nomeDaFuncao&render=explicit: o script chama a função quando a API
// estiver pronta, e nada é desenhado sozinho (o React desenha com .render()).

const carregando = new Map(); // url → Promise

let contador = 0;

/**
 * carregarScript("https://js.hcaptcha.com/1/api.js", { hl: "pt" })
 *   .then(() => window.hcaptcha.render(...))
 */
export function carregarScript(url, parametros = {}) {
  const chave = `${url}?${new URLSearchParams(parametros)}`;
  if (carregando.has(chave)) return carregando.get(chave);

  const promessa = new Promise((resolve, reject) => {
    const callback = `__captchaPronto${++contador}`;
    window[callback] = () => {
      delete window[callback];
      resolve();
    };

    const busca = new URLSearchParams({ ...parametros, onload: callback, render: "explicit" });
    const script = document.createElement("script");
    script.src = `${url}?${busca}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      carregando.delete(chave);
      script.remove();
      reject(new Error(`Não foi possível carregar ${url}. Verifique a internet.`));
    };
    document.head.appendChild(script);
  });

  carregando.set(chave, promessa);
  return promessa;
}

/** Cria uma <div> nova dentro do container (o widget é desenhado nela). */
export function novaDivDoWidget(container) {
  const div = document.createElement("div");
  container.appendChild(div);
  return div;
}
