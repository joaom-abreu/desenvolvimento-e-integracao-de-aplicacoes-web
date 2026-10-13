import StationRow from "./StationRow";
import "./StationsTable.css";

const TOTAL_COLUNAS = 15;

/**
 * Tabela de estações.
 * Larguras em percentual (somam 100%): a tabela se ajusta à largura disponível
 * em vez de forçar scroll horizontal; o texto quebra dentro de cada coluna.
 */
function StationsTable({
  stations,
  carregando,
  erro,
  favoriteUuids,
  favoritosHabilitados,
  salvando,
  onToggleFavorite,
}) {
  let mensagem = null;
  if (carregando) mensagem = "Sintonizando estações...";
  else if (erro) mensagem = erro;
  else if (stations.length === 0) mensagem = "Nenhuma rádio encontrada para esses filtros.";

  return (
    <div className="table-wrapper">
      <table>
        <colgroup>
          <col style={{ width: "3%" }} /> {/* ★ */}
          <col style={{ width: "3%" }} /> {/* # */}
          <col style={{ width: "8%" }} /> {/* Favicon */}
          <col style={{ width: "11%" }} /> {/* Nome */}
          <col style={{ width: "13%" }} /> {/* URL */}
          <col style={{ width: "10%" }} /> {/* Tags */}
          <col style={{ width: "4%" }} /> {/* Status */}
          <col style={{ width: "9%" }} /> {/* Idioma */}
          <col style={{ width: "4%" }} /> {/* Votos */}
          <col style={{ width: "4%" }} /> {/* Cliques */}
          <col style={{ width: "5%" }} /> {/* Tendência */}
          <col style={{ width: "4%" }} /> {/* Local */}
          <col style={{ width: "4%" }} /> {/* Bitrate */}
          <col style={{ width: "4%" }} /> {/* Codec */}
          <col style={{ width: "12%" }} /> {/* Player */}
        </colgroup>
        <thead>
          <tr>
            <th>★</th>
            <th>#</th>
            <th>Favicon</th>
            <th>Nome</th>
            <th>URL</th>
            <th>Tags</th>
            <th>Status</th>
            <th>Idioma</th>
            <th>Votos</th>
            <th>Cliques</th>
            <th>Tendência</th>
            <th>Local</th>
            <th>Bitrate</th>
            <th>Codec</th>
            <th>Player</th>
          </tr>
        </thead>
        <tbody>
          {mensagem ? (
            <tr>
              <td colSpan={TOTAL_COLUNAS} className="table-message">
                {mensagem}
              </td>
            </tr>
          ) : (
            stations.map((station, index) => (
              <StationRow
                key={station.stationuuid}
                station={station}
                index={index}
                favorite={favoriteUuids.has(station.stationuuid)}
                favoritosHabilitados={favoritosHabilitados}
                salvando={salvando.has(station.stationuuid)}
                onToggleFavorite={onToggleFavorite}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StationsTable;
