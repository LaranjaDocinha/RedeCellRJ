import { useState, useEffect } from 'react';

/**
 * Hook customizado para "atrasar" a atualização de um valor.
 * Isso é útil para evitar chamadas de API a cada tecla pressionada em um campo de busca.
 * @param {any} value - O valor a ser "atrasado".
 * @param {number} delay - O tempo de atraso em milissegundos.
 * @returns {any} - O valor "atrasado".
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configura um timer para atualizar o valor "atrasado" após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timer se o valor mudar (ex: usuário continua digitando)
    // Isso evita que o valor antigo seja definido se um novo valor chegar antes do fim do delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Só re-executa se o valor ou o delay mudarem

  return debouncedValue;
}
