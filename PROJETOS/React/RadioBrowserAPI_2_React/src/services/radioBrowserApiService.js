import apiConfig from "../config/apiConfig";
import RadioStation from "../model/RadioStation";

/**
 * Busca e ordena estações, países e estados na Radio Browser API.
 * Mesmas funções do RadioBrowserApiService.java; o RestTemplate virou fetch.
 */

/** Ordem alfabética do português do Brasil (o Collator com Locale("pt", "BR")). */
const PT_BR_COLLATOR = new Intl.Collator("pt-BR");

/** Favicon padrão quando a estação não tem um (public/imgs/aradio.webp). */
export const FAVICON_PADRAO = `${import.meta.env.BASE_URL}imgs/aradio.webp`;

// ---------- Estações ----------

export async function listRadioStations(country, state) {
  const url = new URL(apiConfig.getSearchUrl());
  url.searchParams.set("limit", "100000");
  url.searchParams.set("order", "name");

  if (country) {
    url.searchParams.set("country", country);
  }
  if (state) {
    url.searchParams.set("state", state);
  }

  const resposta = await fetch(url);

  if (!resposta.ok) {
    if (resposta.status === 502) {
      throw new Error("Serviço indisponível. Por favor, tente novamente mais tarde.");
    }
    throw new Error("Não foi possível obter as estações de rádio devido a um problema no servidor.");
  }

  const radioStations = extractRadioStations(await resposta.json());
  radioStations.sort((a, b) => b.votes - a.votes);
  return radioStations;
}

// ---------- País e estado: carregados de forma independente, cada um ordenado ----------

export function listCountries() {
  return fetchList(new URL(apiConfig.getCountriesUrl()));
}

export function listStates() {
  // Lista mundial completa de estados, sem depender do país selecionado.
  // limit alto pra não bater no corte que a API costuma aplicar por padrão.
  const url = new URL(apiConfig.getStatesUrl());
  url.searchParams.set("limit", "100000");
  url.searchParams.set("order", "name");
  return fetchList(url);
}

async function fetchList(url) {
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    const items = await resposta.json();
    if (!Array.isArray(items)) return [];

    items.sort((a, b) => PT_BR_COLLATOR.compare(String(a.name), String(b.name)));
    return items;
  } catch (e) {
    console.error("Erro ao buscar lista:", e.message);
    return [];
  }
}

// ---------- Extração de estações ----------

const texto = (v) => (v == null ? "" : String(v));
const inteiro = (v) => (v == null ? 0 : Math.trunc(Number(v)) || 0);
const decimal = (v) => (v == null ? 0 : Number(v) || 0);

function extractRadioStations(stationsData) {
  const radioStations = [];

  for (const m of stationsData ?? []) {
    const station = new RadioStation();

    station.changeuuid = texto(m.changeuuid);
    station.stationuuid = texto(m.stationuuid);
    station.serveruuid = texto(m.serveruuid);
    station.name = texto(m.name);
    station.url = texto(m.url);
    station.urlResolved = texto(m.url_resolved);
    station.homepage = texto(m.homepage);
    station.favicon = m.favicon ? m.favicon : FAVICON_PADRAO;
    station.tags = texto(m.tags);
    station.country = texto(m.country);
    station.countrycode = texto(m.countrycode);
    station.iso3166_2 = texto(m.iso_3166_2);
    station.state = texto(m.state);
    station.language = texto(m.language);
    station.languagecodes = texto(m.languagecodes);

    station.votes = inteiro(m.votes);
    station.lastchangetime = texto(m.lastchangetime);
    station.lastchangetimeIso8601 = texto(m.lastchangetime_iso8601);
    station.codec = texto(m.codec);
    station.bitrate = inteiro(m.bitrate);
    station.hls = inteiro(m.hls);
    station.lastcheckok = inteiro(m.lastcheckok);
    station.lastchecktime = texto(m.lastchecktime);
    station.lastchecktimeIso8601 = texto(m.lastchecktime_iso8601);
    station.lastcheckoktime = texto(m.lastcheckoktime);
    station.lastcheckoktimeIso8601 = texto(m.lastcheckoktime_iso8601);
    station.lastlocalchecktime = texto(m.lastlocalchecktime);
    station.lastlocalchecktimeIso8601 = texto(m.lastlocalchecktime_iso8601);
    station.clicktimestamp = texto(m.clicktimestamp);
    station.clicktimestampIso8601 = texto(m.clicktimestamp_iso8601);
    station.clickcount = inteiro(m.clickcount);
    station.clicktrend = inteiro(m.clicktrend);
    station.sslError = inteiro(m.ssl_error);
    station.geoLat = decimal(m.geo_lat);
    station.geoLong = decimal(m.geo_long);
    station.hasExtendedInfo = Boolean(m.has_extended_info);

    radioStations.push(station);
  }

  return radioStations;
}
