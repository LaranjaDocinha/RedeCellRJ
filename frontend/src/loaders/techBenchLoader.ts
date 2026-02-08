import { LoaderFunctionArgs } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export const techBenchLoader = async ({ request }: LoaderFunctionArgs) => {
  const token = localStorage.getItem('token') || '';

  try {
    // Buscar OS atribuídas ao técnico logado ou fila geral
    // Como não temos um endpoint 'my-queue' ainda, vamos buscar todas 'Aguardando Reparo' ou 'Em Reparo'
    const response = await axios.get(`${API_BASE_URL}/api/service-orders?status=Em Reparo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { activeOrders: response.data };
  } catch (error) {
    console.error('Failed to load tech bench data:', error);
    return { activeOrders: [] };
  }
};
