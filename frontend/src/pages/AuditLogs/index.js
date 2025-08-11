import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, CardBody, CardTitle, Badge } from 'reactstrap';
import toast from 'react-hot-toast';
import moment from 'moment';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import AdvancedTable from '../../components/Common/AdvancedTable';
import { get } from '../../helpers/api_helper';
import useApi from '../../hooks/useApi';

const AuditLogs = () => {
  document.title = 'Logs de Auditoria | PDV Web';

  const [logs, setLogs] = useState([]);
  const { request: fetchLogs, loading, error } = useApi(get);

  const loadLogs = () => {
    fetchLogs('/api/settings/audit-logs')
      .then((response) => {
        if (response) {
          setLogs(response);
        }
      })
      .catch((err) => {
        toast.error('Falha ao carregar logs de auditoria.');
        console.error(err);
      });
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const columns = useMemo(
    () => [
      {
        header: 'Data/Hora',
        accessorKey: 'timestamp',
        cell: (info) => moment(info.getValue()).format('DD/MM/YYYY HH:mm:ss'),
      },
      {
        header: 'Usuário',
        accessorKey: 'user_name',
      },
      {
        header: 'Descrição',
        accessorKey: 'description',
      },
      {
        header: 'Tipo de Entidade',
        accessorKey: 'entity_type',
        cell: (info) => (
          <Badge className='text-capitalize' color='info'>
            {info.getValue() || 'N/A'}
          </Badge>
        ),
      },
      {
        header: 'ID da Entidade',
        accessorKey: 'entity_id',
        cell: (info) => info.getValue() || 'N/A',
      },
    ],
    [],
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Logs de Auditoria' title='Administração' />

          <Card>
            <CardBody>
              <CardTitle className='h4 mb-4'>Registros de Atividade do Sistema</CardTitle>
              <AdvancedTable
                columns={columns}
                data={logs}
                emptyStateActionText={''}
                emptyStateIcon={''}
                emptyStateMessage={'Nenhum registro de auditoria encontrado.'}
                emptyStateTitle={'Logs Vazios'}
                loading={loading}
                persistenceKey='auditLogsTable'
              />
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AuditLogs;
