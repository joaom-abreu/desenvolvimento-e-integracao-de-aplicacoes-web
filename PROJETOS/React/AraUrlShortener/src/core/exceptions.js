// exceptions.js
// As mesmas exceções do pacote exception/ do Spring Boot, agora em JavaScript.
// As telas usam "instanceof" para decidir o que mostrar (como o GlobalExceptionHandler).

/** Link curto não existe (no Spring: 404 Not Found). */
export class UrlNotFoundException extends Error {
  constructor(message = "Esse link curto não existe ou foi excluído.") {
    super(message);
    this.name = "UrlNotFoundException";
  }
}

/** Link curto existe, mas passou da data de expiração (no Spring: 410 Gone). */
export class UrlExpiredException extends Error {
  constructor(message = "Esse link curto expirou e não redireciona mais.") {
    super(message);
    this.name = "UrlExpiredException";
  }
}

/** URL longa inválida (no Spring: o @Pattern do UrlRequestDTO). */
export class InvalidUrlException extends Error {
  constructor(message = "Cole uma URL válida, começando com http:// ou https://.") {
    super(message);
    this.name = "InvalidUrlException";
  }
}

/** Alias ou data de expiração inválidos. */
export class InvalidOptionException extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidOptionException";
  }
}

/** Alias já usado por outro link (parecido com o UserAlreadyExistsException). */
export class AliasAlreadyExistsException extends Error {
  constructor(alias) {
    super(`O alias "${alias}" já está em uso. Escolha outro.`);
    this.name = "AliasAlreadyExistsException";
  }
}
