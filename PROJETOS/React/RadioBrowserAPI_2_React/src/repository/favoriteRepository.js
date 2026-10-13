import { supabase } from "../config/supabaseClient";

/**
 * Acesso à tabela "favorites" do Supabase.
 *
 * Faz o papel do FavoriteRepository (Spring Data JPA): mesmos nomes de métodos
 * (findAllStationUuids, existsById, deleteById, save), só que cada um vira uma
 * chamada do supabase-js para a Data API, em vez de SQL gerado pelo Hibernate.
 */

const TABELA = "favorites";

function verificar(error) {
  if (error) {
    throw new Error(`Supabase: ${error.message}`);
  }
}

function cliente() {
  if (!supabase) {
    throw new Error("Supabase não configurado: preencha o .env.local (veja o README).");
  }
  return supabase;
}

/** select station_uuid from favorites */
export async function findAllStationUuids() {
  const { data, error } = await cliente().from(TABELA).select("station_uuid");
  verificar(error);
  return data.map((linha) => linha.station_uuid);
}

/** select station_uuid from favorites where station_uuid = ? (existe ou não) */
export async function existsById(stationUuid) {
  const { data, error } = await cliente()
    .from(TABELA)
    .select("station_uuid")
    .eq("station_uuid", stationUuid)
    .maybeSingle();
  verificar(error);
  return data !== null;
}

/** delete from favorites where station_uuid = ? */
export async function deleteById(stationUuid) {
  const { error } = await cliente().from(TABELA).delete().eq("station_uuid", stationUuid);
  verificar(error);
}

/**
 * insert into favorites (station_uuid) values (?)
 * O created_at é preenchido pelo banco (default now()), o papel do @PrePersist.
 */
export async function save(stationUuid) {
  const { error } = await cliente().from(TABELA).insert({ station_uuid: stationUuid });
  verificar(error);
}
