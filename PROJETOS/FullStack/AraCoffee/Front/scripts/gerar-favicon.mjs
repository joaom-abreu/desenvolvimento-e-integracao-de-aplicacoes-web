/**
 * Gera o public/favicon.svg a partir de um ícone do React Icons.
 *
 * O ícone da aba é o PiCoffeeFill (Phosphor Icons, xícara com vapor),
 * desenhado em marrom sobre um círculo crema, as mesmas cores da logo.
 *
 * Roda sozinho antes do build (script "prebuild") e pode ser chamado
 * à mão com: npm run favicon
 *
 * Para trocar o ícone, mude o import abaixo (ex.: GiCoffeeCup de "react-icons/gi")
 * e rode o script de novo.
 */
import { writeFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PiCoffeeFill as Icone } from "react-icons/pi";

const CREMA = "#F1E3CF";
const MARROM_LOGO = "#5B3220";

// O React Icons devolve um <svg viewBox="0 0 256 256"> com os <path> do desenho
const svgDoIcone = renderToStaticMarkup(createElement(Icone, { color: MARROM_LOGO }));
const viewBox = svgDoIcone.match(/viewBox="([^"]+)"/)[1];
const desenho = svgDoIcone.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
const [, , largura] = viewBox.split(" ").map(Number);

// Círculo crema de 64×64 com o ícone ocupando ~70% do centro
const escala = 44 / largura;
const deslocamento = (64 - 44) / 2;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <!-- Gerado por scripts/gerar-favicon.mjs a partir do PiCoffeeFill (react-icons/pi). Não edite à mão. -->
  <circle cx="32" cy="32" r="31" fill="${CREMA}"/>
  <g transform="translate(${deslocamento} ${deslocamento + 1}) scale(${escala})" fill="${MARROM_LOGO}">${desenho}</g>
</svg>
`;

writeFileSync(new URL("../public/favicon.svg", import.meta.url), favicon);
console.log("favicon.svg gerado com o PiCoffeeFill (react-icons/pi).");
