// exceptions.js
// Erros do domínio Pix. O "field" diz qual campo do formulário está errado,
// para a interface mostrar a mensagem embaixo do campo certo.

export class PixValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "PixValidationError";
    this.field = field;
  }
}

export class PixParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "PixParseError";
  }
}
