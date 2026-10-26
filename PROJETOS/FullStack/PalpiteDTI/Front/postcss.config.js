// PostCSS = pós-processador de CSS. Roda DEPOIS do Sass, sobre o CSS já gerado.
// O autoprefixer acrescenta prefixos de navegador (-webkit-, -moz-...) só onde
// a lista "browserslist" do package.json ainda precisa deles.
export default {
  plugins: {
    autoprefixer: {},
  },
};
