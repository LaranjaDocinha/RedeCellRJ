import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'reactstrap';
import { get } from '../../../helpers/api_helper';
import ActivityLogTable from '../../../components/Common/ActivityLogTable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const defaultColumns = [
  {
    id: 'changed_at',
    Header: 'Data',
    accessor: 'changed_at',
    Cell: ({ value }) => format(new Date(value), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
  },
  {
    id: 'user_name',
    Header: 'Usuário',
    accessor: 'user_name',
  },
  {
    id: 'setting_key',
    Header: 'Configuração',
    accessor: 'setting_key',
  },
  {
    id: 'old_value',
    Header: 'Valor Antigo',
    accessor: 'old_value',
    Cell: ({ value }) => <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f8f9fa', padding: '5px', borderRadius: '4px' }}>{String(value)}</pre>,
  },
  {
    id: 'new_value',
    Header: 'Valor Novo',
    accessor: 'new_value',
    Cell: ({ value }) => <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f8f9fa', padding: '5px', borderRadius: '4px' }}>{String(value)}</pre>,
  },
];

const SettingsLogTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageCount, setPageCount] = useState(0);

  const fetchLogs = useCallback(async ({ pageIndex, pageSize }) => {
    setLoading(true);
    try {
      const response = await get(`/api/settings/logs?page=${pageIndex + 1}&limit=${pageSize}`);
      setData(response.logs);
      setPageCount(response.totalPages);
    } catch (err) {
      setError('Não foi possível carregar os logs de atividade.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const columns = useMemo(() => defaultColumns, []);

  if (error) {
    return <Alert color="danger">{error}</Alert>;
  }

  return (
    <div>
      <h4 className="card-title mb-4">Histórico de Alterações nas Configurações</h4>
      <ActivityLogTable
        columns={columns}
        data={data}
        loading={loading}
        pageCount={pageCount}
        onFetchData={fetchLogs}
      />
    </div>
  );
};

export default SettingsLogTab;