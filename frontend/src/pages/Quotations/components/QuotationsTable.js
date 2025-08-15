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
import { FileText, Edit, Trash2 } from 'react-feather'; // Added react-feather icons
import useApi from '../../../hooks/useApi';
import toast from 'react-hot-toast';

const QuotationsTable = ({ quotations, isLoading, error, onEdit, onDeleteSuccess, pagination, onPageChange }) => {
  const { request: deleteQuotation } = useApi('delete');
  const { request: generatePdf } = useApi('get');

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta cotação?')) {
      try {
        await deleteQuotation(`/api/quotations/${id}`);
        toast.success('Cotação excluída com sucesso!');
        onDeleteSuccess();
      } catch (err) {
        toast.error(err.message || 'Falha ao excluir a cotação.');
      }
    }
  };

  const handleViewPdf = async (id) => {
    try {
      const response = await generatePdf(`/api/quotations/pdf/${id}`, null, { responseType: 'blob' });
      const fileURL = URL.createObjectURL(response);
      window.open(fileURL, '_blank');
    } catch (err) {
      toast.error(err.message || 'Falha ao gerar o PDF da cotação.');
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
    return <Alert color="danger">Erro ao carregar cotações: {error.message}</Alert>;
  }

  if (!quotations || quotations.length === 0) {
    return <Alert color="info">Nenhuma cotação encontrada.</Alert>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'secondary';
      case 'Sent': return 'info';
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      case 'ConvertedToSale': return 'primary';
      default: return 'light';
    }
  };

  return (
    <>
      <div className="table-responsive">
        <Table className="table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Cliente</th>
              <th>Data da Cotação</th>
              <th>Válido Até</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quotation) => (
              <tr key={quotation.id}>
                <td>{quotation.customer_name}</td>
                <td>{formatDate(quotation.quotation_date)}</td>
                <td>{formatDate(quotation.valid_until_date)}</td>
                <td>{formatCurrency(quotation.total_amount)}</td>
                <td>
                  <Badge color={getStatusColor(quotation.status)} pill>
                    {quotation.status}
                  </Badge>
                </td>
                <td className="text-end">
                  <Button color="light" size="sm" className="me-2" onClick={() => handleViewPdf(quotation.id)}>
                    <FileText size={16} />
                  </Button>
                  <Button color="light" size="sm" className="me-2" onClick={() => onEdit(quotation)}>
                    <Edit size={16} />
                  </Button>
                  <Button color="light" size="sm" onClick={() => handleDelete(quotation.id)}>
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

QuotationsTable.propTypes = {
  quotations: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
  pagination: PropTypes.object,
  onPageChange: PropTypes.func.isRequired,
};

export default QuotationsTable;
