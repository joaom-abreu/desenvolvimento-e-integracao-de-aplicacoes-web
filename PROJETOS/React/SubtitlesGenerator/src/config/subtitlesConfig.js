// subtitlesConfig.js
// Configurações centrais do projeto.
//
// A chave do Gemini NÃO fica aqui: ela é lida só no servidor (GEMINI_API_KEY no
// .env.local), pela Vercel Function api/subtitles.js e pelo vite.config.js no npm run dev.
const SUBTITLES_CONFIG = {
  // Rota do próprio site que fala com o Gemini (ver api/_subtitles.js)
  API_PATH: "/api/subtitles",

  // Arquivos aceitos no seletor (o ffmpeg.wasm lê praticamente qualquer formato)
  ACCEPT:
    "video/*,audio/*,.mp4,.avi,.mkv,.mov,.wmv,.flv,.webm,.m4v,.mpg,.mpeg,.ts,.3gp,.mp3,.wav,.m4a,.ogg",

  // Áudio enviado ao Gemini: mono, 16 kHz, MP3 de 32 kbps (≈ 240 KB por minuto)
  AUDIO_SAMPLE_RATE: 16000,
  AUDIO_BITRATE: "32k",
  AUDIO_MIME_TYPE: "audio/mp3",

  // O áudio é dividido em trechos: trechos curtos = tempos mais precisos
  CHUNK_OPTIONS: [
    { value: 120, label: "2 minutos (mais preciso)" },
    { value: 180, label: "3 minutos (recomendado)" },
    { value: 300, label: "5 minutos (menos pedidos)" },
  ],
  DEFAULT_CHUNK_SECONDS: 180,

  // Idioma falado no vídeo (a legenda é sempre em português do Brasil)
  LANGUAGES: [
    { value: "auto", label: "Automático (detectar)" },
    { value: "pt", label: "Português" },
    { value: "en", label: "Inglês" },
    { value: "es", label: "Espanhol" },
    { value: "fr", label: "Francês" },
    { value: "it", label: "Italiano" },
    { value: "de", label: "Alemão" },
    { value: "ja", label: "Japonês" },
    { value: "ko", label: "Coreano" },
    { value: "zh", label: "Chinês" },
  ],
  DEFAULT_LANGUAGE: "auto",

  // Padrão de legendagem (o mesmo dos guias de estilo de streaming em pt-BR)
  LINE_OPTIONS: [32, 37, 42],
  DEFAULT_MAX_LINE: 42, // caracteres por linha
  MAX_LINES: 2, // linhas por legenda
  MIN_DURATION: 1, // segundos que uma legenda fica na tela, no mínimo
  MAX_DURATION: 7, // ... e no máximo
  MIN_GAP: 0.08, // intervalo mínimo entre duas legendas (segundos)

  // Últimas legendas de um trecho que vão como contexto para o próximo
  CONTEXT_CUES: 3,

  // Novas tentativas quando o Gemini pede para esperar (cota) ou fica instável
  MAX_RETRIES: 3,
  DEFAULT_RETRY_SECONDS: 20,

  // Opções marcadas quando a página abre
  DEFAULT_SOUNDS: false, // indicar sons entre colchetes ([música], [risos])

  // Arquivo baixado: "video.pt-BR.srt" (players como o VLC carregam sozinhos)
  SRT_SUFFIX: ".pt-BR.srt",
  SRT_BOM: true, // UTF-8 com BOM: acentos corretos em TVs e players antigos
};

export default SUBTITLES_CONFIG;
