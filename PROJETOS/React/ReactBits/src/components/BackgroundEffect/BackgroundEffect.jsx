import "./BackgroundEffect.css";

/**
 * Coloca um efeito do React Bits ocupando a tela inteira.
 *
 * - layer "fundo"  → fica atrás do conteúdo (z-index 0)
 * - layer "frente" → o próprio componente já se posiciona por cima
 *                    (é o caso do SplashCursor, que tem position: fixed)
 *
 * pointer-events: none deixa os cliques passarem para a página.
 * Os efeitos escutam o mouse no window, então funcionam mesmo assim.
 */
const BackgroundEffect = ({ effect }) => {
  const { Component, props, layer } = effect;

  if (layer === "frente") return <Component {...props} />;

  return (
    <div className="background-effect" aria-hidden="true">
      <Component {...props} />
    </div>
  );
};

export default BackgroundEffect;
