import * as favoriteRepository from "../repository/favoriteRepository";

/**
 * Guarda os favoritos no Supabase (PostgreSQL), persistindo entre recarregamentos da página.
 * Mesmas funções do FavoriteService.java.
 */

/** Verifica uma estação específica (faz uma consulta por chamada). */
export async function isFavorite(stationUuid) {
  return stationUuid != null && favoriteRepository.existsById(stationUuid);
}

/** Busca todos os favoritos numa única consulta (evita 1 consulta por estação na listagem). */
export async function getFavoriteUuids() {
  return new Set(await favoriteRepository.findAllStationUuids());
}

/**
 * Se a estação já é favorita, remove; senão, insere.
 * Devolve o novo estado (true = agora é favorita).
 */
export async function toggle(stationUuid) {
  if (stationUuid == null) return false;

  if (await favoriteRepository.existsById(stationUuid)) {
    await favoriteRepository.deleteById(stationUuid);
    return false;
  }
  await favoriteRepository.save(stationUuid);
  return true;
}
