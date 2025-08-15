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
} from 'reactstrap';

const SalesHistoryTable = ({ sales, isLoading, error, onViewDetails, pagination, onPageChange }) => {
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
    return <Alert color="danger">Erro ao carregar histórico de vendas: {error.message}</Alert>;
  }

  if (!sales || sales.length === 0) {
    return <Alert color="info">Nenhuma venda encontrada com os filtros aplicados.</Alert>;
  }

  return (
    <>
      <div className="table-responsive">
        <Table className="table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID da Venda</th>
              <th>Cliente</th>
              <th>Valor Total</th>
              <th>Método de Pagamento</th>
              <th>Data da Venda</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>#{sale.id}</td>
                <td>{sale.customer_name}</td>
                <td>{formatCurrency(sale.total_amount)}</td>
                <td>{sale.payment_method}</td>
                <td>{formatDate(sale.sale_date)}</td>
                <td className="text-end">
                  <Button color="info" size="sm" onClick={() => onViewDetails(sale)}>
                    <i className="bx bx-info-circle me-1"></i> Detalhes
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination className="justify-content-end mt-3">
          {[...Array(pagination.totalPages).keys()].map(page => (
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

SalesHistoryTable.propTypes = {
  sales: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  onViewDetails: PropTypes.func.isRequired,
  pagination: PropTypes.object,
  onPageChange: PropTypes.func.isRequired,
};

export default SalesHistoryTable;
