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
import { Edit, Trash2 } from 'react-feather'; // Added react-feather icons
import useApi from '../../../hooks/useApi';
import toast from 'react-hot-toast';

const ProjectionsTable = ({ projections, isLoading, error, onEdit, onDeleteSuccess, pagination, onPageChange }) => {
  const { request: deleteProjection } = useApi('delete');

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta projeção?')) {
      try {
        await deleteProjection(`/api/cashflow/projections/${id}`);
        toast.success('Projeção excluída com sucesso!');
        onDeleteSuccess();
      } catch (err) {
        toast.error(err.message || 'Falha ao excluir a projeção.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  };

  if (isLoading) {
    return <div className="text-center p-5"><Spinner color="primary">Carregando...</Spinner></div>;
  }

  if (error) {
    return <Alert color="danger">Erro ao carregar projeções: {error.message}</Alert>;
  }

  if (!projections || projections.length === 0) {
    return <Alert color="info">Nenhuma projeção encontrada para o período selecionado.</Alert>;
  }

  return (
    <>
      <div className="table-responsive">
        <Table className="table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Tipo</th>
              <th>Data da Projeção</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((projection) => (
              <tr key={projection.id}>
                <td>{projection.description}</td>
                <td className={projection.type === 'inflow' ? 'text-success' : 'text-danger'}>
                  {projection.type === 'inflow' ? '+' : '-'} {formatCurrency(projection.amount)}
                </td>
                <td>
                  <Badge color={projection.type === 'inflow' ? 'success' : 'danger'} pill>
                    {projection.type === 'inflow' ? 'Entrada' : 'Saída'}
                  </Badge>
                </td>
                <td>{formatDate(projection.projection_date)}</td>
                <td className="text-end">
                  <Button color="light" size="sm" className="me-2" onClick={() => onEdit(projection)}>
                    <Edit size={16} />
                  </Button>
                  <Button color="light" size="sm" onClick={() => handleDelete(projection.id)}>
                    <Trash2 size={16} />
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

ProjectionsTable.propTypes = {
  projections: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
  pagination: PropTypes.object,
  onPageChange: PropTypes.func.isRequired,
};

export default ProjectionsTable;
