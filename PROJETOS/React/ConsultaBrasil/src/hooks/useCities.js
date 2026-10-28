import { useMemo } from "react";
import { listCities } from "../services/locationService";
import useRequest from "./useRequest";

/** Cidades do estado escolhido. Sem estado, não busca nada. */
export default function useCities(uf) {
  const request = useRequest((signal) => listCities(uf, { signal }), uf || null);
  const cities = useMemo(() => request.data?.cities ?? [], [request.data]);
  return { ...request, cities };
}
