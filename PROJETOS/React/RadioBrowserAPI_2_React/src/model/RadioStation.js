/**
 * Representa uma estação de rádio vinda da Radio Browser API.
 * Mesmos campos do RadioStation.java (os nomes com "_" da API viram camelCase).
 */
export default class RadioStation {
  changeuuid = "";
  stationuuid = "";
  serveruuid = "";
  name = "";
  url = "";
  urlResolved = "";
  homepage = "";
  favicon = "";
  tags = "";
  country = "";
  countrycode = "";
  iso3166_2 = "";
  state = "";
  language = "";
  languagecodes = "";
  votes = 0;
  lastchangetime = "";
  lastchangetimeIso8601 = "";
  codec = "";
  bitrate = 0;
  hls = 0;
  lastcheckok = 0;
  lastchecktime = "";
  lastchecktimeIso8601 = "";
  lastcheckoktime = "";
  lastcheckoktimeIso8601 = "";
  lastlocalchecktime = "";
  lastlocalchecktimeIso8601 = "";
  clicktimestamp = "";
  clicktimestampIso8601 = "";
  clickcount = 0;
  clicktrend = 0;
  sslError = 0;
  geoLat = 0;
  geoLong = 0;
  hasExtendedInfo = false;

  // O "favorite" do Java não fica aqui: a tela consulta o Set de UUIDs vindo
  // do Supabase (useFavoritos), então favoritar não precisa recriar a estação.
}
