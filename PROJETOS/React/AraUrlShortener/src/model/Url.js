/**
 * Um link curto. Mesmos campos do model/Url.java, mais o contador de cliques.
 * O supabase-js devolve as colunas em snake_case; aqui viram camelCase.
 */
export default class Url {
  constructor({ shortUrl, originalUrl, expirationDate = null, clicks = 0, createdAt = new Date() }) {
    this.shortUrl = shortUrl;
    this.originalUrl = originalUrl;
    this.expirationDate = expirationDate ? new Date(expirationDate) : null;
    this.clicks = Number(clicks);
    this.createdAt = new Date(createdAt);
  }

  /** Converte uma linha do banco ({ short_url, original_url, ... }) em Url. */
  static fromRow(row) {
    return new Url({
      shortUrl: row.short_url,
      originalUrl: row.original_url,
      expirationDate: row.expiration_date,
      clicks: row.clicks,
      createdAt: row.created_at,
    });
  }

  /** true se tem data de expiração e ela já passou. */
  get expired() {
    return this.expirationDate !== null && this.expirationDate <= new Date();
  }
}
