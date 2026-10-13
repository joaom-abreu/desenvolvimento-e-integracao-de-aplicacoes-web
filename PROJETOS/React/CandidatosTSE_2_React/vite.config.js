import fs from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Pasta onde ficam as fotos depois de descompactar o images.zip.
// Equivale a src/main/resources/static/images/candidatos/ no projeto Spring Boot.
const PASTA_FOTOS = path.resolve("public/images/candidatos");

const ID_VIRTUAL = "virtual:fotos-candidatos";
const ID_RESOLVIDO = "\0" + ID_VIRTUAL;

// No Spring, o service perguntava ao classpath se a foto existia
// (new ClassPathResource(...).exists()). O navegador não enxerga o disco, então
// este plugin lê a pasta UMA vez (no npm run dev e no npm run build) e entrega a
// lista de arquivos como um módulo: import fotos from "virtual:fotos-candidatos".
// Se o images.zip ainda não foi descompactado, a lista vem vazia.
function fotosCandidatos() {
  return {
    name: "fotos-candidatos",
    resolveId(id) {
      if (id === ID_VIRTUAL) return ID_RESOLVIDO;
    },
    load(id) {
      if (id !== ID_RESOLVIDO) return;
      const arquivos = fs.existsSync(PASTA_FOTOS)
        ? fs.readdirSync(PASTA_FOTOS).filter((nome) => nome.toLowerCase().endsWith(".jpg"))
        : [];
      return `export default ${JSON.stringify(arquivos)};`;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), fotosCandidatos()],
});
