import { useMatches } from 'react-router-dom';

/**
 * Hook para encontrar o "handle" da rota mais profunda que o possui.
 * O handle é um objeto que podemos adicionar às definições de rota para metadados.
 * @returns {object|null} O objeto handle da rota correspondente ou nulo.
 */
export function useRouteHandle() {
  const matches = useMatches();
  
  // O `matches` é um array das rotas correspondentes, da mais alta para a mais baixa.
  // Queremos o handle da última rota no array que tenha um, pois é a mais específica.
  const matchWithHandle = [...matches].reverse().find(m => m.handle);

  return matchWithHandle ? matchWithHandle.handle : null;
}
