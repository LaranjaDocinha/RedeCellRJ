
import React, { useState, useEffect, useCallback } from 'react';
import { get } from '../helpers/api_helper'; // 1. Importar o helper
import CalendarView from '../components/Calendar/CalendarView';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast from 'react-hot-toast';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Usando useCallback para memoizar a função de busca
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 90);

      // 2. Usar a função 'get' do helper
      const response = await get('/api/calendar/events', { // 3. Remover URL base
        params: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
      }); // 4. Remover withCredentials

      setEvents(response); // O helper já retorna response.data
    } catch (err) {
      // 5. O interceptor já mostra um toast de erro.
      // Podemos adicionar um log se necessário, mas evitamos toasts duplicados.
      console.error("Erro detalhado ao buscar eventos:", err);
      // Opcional: se precisar de uma mensagem específica para esta página
      if (!toast.isActive('calendar-error')) {
        toast.error('Não foi possível carregar os eventos do calendário.', { id: 'calendar-error' });
      }
    } finally {
      setLoading(false);
    }
  }, []); // A dependência está vazia porque a função não depende de props ou state externo

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // Agora a dependência é a função memoizada

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <h2>Calendário</h2>
        <Skeleton height={600} />
      </div>
    );
  }

  // A verificação de erro pode ser removida se o interceptor já trata tudo
  // ou mantida para um fallback.
  if (!events.length && loading === false) {
    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4">Calendário de Atividades</h2>
            <div className="card">
                <div className="card-body text-center">
                    <p>Nenhum evento encontrado ou falha no carregamento.</p>
                    <button className="btn btn-primary" onClick={fetchEvents}>
                        Tentar Novamente
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">Calendário de Atividades</h2>
      <div className="card">
        <div className="card-body">
            <CalendarView events={events} />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
