import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Button,
  Spinner,
  Alert,
  Pagination,
  PaginationItem,
  PaginationLink,
  Badge
} from 'reactstrap';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';

const LeadsTable = ({ leads, isLoading, error, onEdit, onDeleteSuccess, pagination, onPageChange }) => {
  const { request: deleteLead } = useApi('delete');

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      try {
        await deleteLead(`/api/leads/${id}`);
        toast.success('Lead excluído com sucesso!');
        onDeleteSuccess();
      } catch (err) {
        toast.error(err.message || 'Falha ao excluir o lead.');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center p-5"><Spinner color="primary">Carregando...</Spinner></div>;
  }

  if (error) {
    return <Alert color="danger">Erro ao carregar leads: {error.message}</Alert>;
  }

  if (!leads || leads.length === 0) {
    return <Alert color="info">Nenhum lead encontrado.</Alert>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Novo': return 'primary';
      case 'Qualificado': return 'success';
      case 'Contato': return 'info';
      case 'Convertido': return 'dark';
      case 'Perdido': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <>
      <div className="table-responsive">
        <Table className="table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Origem</th>
              <th>Status</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>{lead.email}</td>
                <td>{lead.phone}</td>
                <td>{lead.source}</td>
                <td>
                  <Badge color={getStatusColor(lead.status)} pill>
                    {lead.status}
                  </Badge>
                </td>
                <td className="text-end">
                  <Button color="primary" size="sm" className="me-2" onClick={() => onEdit(lead)}>
                    <i className="bx bx-pencil"></i>
                  </Button>
                  <Button color="danger" size="sm" onClick={() => handleDelete(lead.id)}>
                    <i className="bx bx-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination && pagination.pages > 1 && (
        <Pagination className="justify-content-end mt-3">
          {[...Array(pagination.pages).keys()].map(page => (
            <PaginationItem key={page + 1} active={page + 1 === pagination.page}>
              <PaginationLink onClick={() => onPageChange(page + 1)}>
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
        </Pagination>
      )}
    </>
  );
};

LeadsTable.propTypes = {
  leads: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
  pagination: PropTypes.object,
  onPageChange: PropTypes.func.isRequired,
};

export default LeadsTable;
