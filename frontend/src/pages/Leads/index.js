import React, { useState, useEffect, useMemo } from 'react';
import { Container, Button, Card, CardBody, CardTitle, Badge } from 'reactstrap';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import AdvancedTable from '../../components/Common/AdvancedTable';
import { get, post, put, del } from '../../helpers/api_helper';
import useApi from '../../hooks/useApi';
import useNotification from '../../hooks/useNotification';

import LeadFormModal from './components/LeadFormModal';

const Leads = () => {
  document.title = 'Gestão de Leads | PDV Web';
  const { showSuccess, showError } = useNotification();

  const [leads, setLeads] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const { request: fetchLeads, loading, error } = useApi(get);
  const { request: deleteLead } = useApi(del);

  const loadLeads = () => {
    fetchLeads('/api/leads')
      .then((response) => {
        if (response) {
          setLeads(response);
        }
      })
      .catch((err) => {
        showError('Falha ao carregar leads.');
        console.error(err);
      });
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  const handleNewClick = () => {
    setSelectedLead(null);
    setModalOpen(true);
  };

  const handleDeleteClick = async (lead) => {
    if (window.confirm(`Tem certeza que deseja excluir o lead ${lead.name}?`)) {
      try {
        await deleteLead(`/api/leads/${lead.id}`);
        showSuccess('Lead excluído com sucesso!');
        loadLeads();
      } catch (err) {
        showError('Falha ao excluir lead.');
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status) => {
    let color = 'secondary';
    switch (status) {
      case 'Novo':
        color = 'info';
        break;
      case 'Qualificado':
        color = 'primary';
        break;
      case 'Contato':
        color = 'warning';
        break;
      case 'Convertido':
        color = 'success';
        break;
      case 'Perdido':
        color = 'danger';
        break;
      default:
        break;
    }
    return <Badge color={color}>{status}</Badge>;
  };

  const columns = useMemo(
    () => [
      {
        header: 'Nome',
        accessorKey: 'name',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Telefone',
        accessorKey: 'phone',
      },
      {
        header: 'Origem',
        accessorKey: 'source',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (info) => getStatusBadge(info.getValue()),
      },
      {
        header: 'Ações',
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className='d-flex gap-2'>
              <Button color='primary' size='sm' onClick={() => handleEditClick(lead)}>
                <i className='bx bx-pencil me-1'></i> Editar
              </Button>
              <Button color='danger' size='sm' onClick={() => handleDeleteClick(lead)}>
                <i className='bx bx-trash me-1'></i> Excluir
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Leads' title='CRM' />

          <Card>
            <CardBody>
              <CardTitle className='h4 mb-4'>Gestão de Leads</CardTitle>
              <div className='mb-3'>
                <Button color='success' onClick={handleNewClick}>
                  <i className='bx bx-plus me-1'></i> Adicionar Novo Lead
                </Button>
              </div>
              <AdvancedTable
                columns={columns}
                data={leads}
                emptyStateActionText={'Adicionar Lead'}
                emptyStateIcon={''}
                emptyStateMessage={'Nenhum lead encontrado.'}
                emptyStateTitle={'Leads Vazios'}
                loading={loading}
                persistenceKey='leadsTable'
                onEmptyStateActionClick={handleNewClick}
                onRowClick={handleEditClick}
              />
            </CardBody>
          </Card>
        </Container>
      </div>

      <LeadFormModal
        isOpen={modalOpen}
        lead={selectedLead}
        toggle={() => setModalOpen(!modalOpen)}
        onSave={loadLeads}
      />
    </React.Fragment>
  );
};

export default Leads;
