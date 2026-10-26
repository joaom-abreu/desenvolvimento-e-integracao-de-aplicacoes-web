// localStorage com try/catch: em modo privado ou com cookies bloqueados ele pode falhar,
// e o jogo precisa continuar funcionando (só não lembra a partida no F5).

export function lerLocal(chave) {
  try {
    return window.localStorage.getItem(chave);
  } catch {
    return null;
  }
}

export function gravarLocal(chave, valor) {
  try {
    if (valor === null || valor === undefined) window.localStorage.removeItem(chave);
    else window.localStorage.setItem(chave, valor);
  } catch {
    /* sem armazenamento: segue sem lembrar */
  }
}
