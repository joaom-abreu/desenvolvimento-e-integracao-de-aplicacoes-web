// Mapa "endereço → função" usado pelo vite.config.js no npm run dev / preview.
// Na Vercel não precisa dele: cada arquivo da pasta api/ já vira uma rota.

import { altchaDesafio } from "./altcha/desafio.js";
import { altcha } from "./altcha/index.js";
import { captchaImagemNova } from "./captcha-imagem/imagem.js";
import { captchaImagem } from "./captcha-imagem/index.js";
import { captchaMatematico } from "./captcha-matematico/index.js";
import { captchaMatematicoPergunta } from "./captcha-matematico/pergunta.js";
import { hcaptcha } from "./hcaptcha.js";
import { recaptchaV2Checkbox } from "./recaptcha-v2-checkbox.js";
import { recaptchaV2Invisivel } from "./recaptcha-v2-invisivel.js";
import { recaptchaV3 } from "./recaptcha-v3.js";
import { turnstile } from "./turnstile.js";

export const ROTAS = {
  "/api/recaptcha-v2-checkbox": recaptchaV2Checkbox,
  "/api/recaptcha-v2-invisivel": recaptchaV2Invisivel,
  "/api/recaptcha-v3": recaptchaV3,
  "/api/hcaptcha": hcaptcha,
  "/api/turnstile": turnstile,
  "/api/altcha": altcha,
  "/api/altcha/desafio": altchaDesafio,
  "/api/captcha-imagem": captchaImagem,
  "/api/captcha-imagem/imagem": captchaImagemNova,
  "/api/captcha-matematico": captchaMatematico,
  "/api/captcha-matematico/pergunta": captchaMatematicoPergunta,
};
