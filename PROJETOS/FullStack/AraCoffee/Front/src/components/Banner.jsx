import "./Banner.css";

/**
 * Faixa com foto no topo das páginas internas.
 * As fotos têm o lado esquerdo escuro e vazio, onde fica o título.
 */
const Banner = ({ imagem, titulo, children, posicao = "right center" }) => (
  <section className="banner" style={{ "--banner-imagem": `url(${imagem})`, "--banner-posicao": posicao }}>
    <div className="banner-interno">
      <h1 className="titulo-pagina">{titulo}</h1>
      {children && <p className="texto-apoio">{children}</p>}
    </div>
  </section>
);

export default Banner;
