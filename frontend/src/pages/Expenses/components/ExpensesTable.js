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
import { AppError } from '../../../utils/appError';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';

const ExpensesTable = ({ expenses, isLoading, error, onEdit, onDeleteSuccess, pagination, onPageChange }) => {
  const { request: deleteExpense } = useApi('delete');

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await deleteExpense(`/api/expenses/${id}`);
        toast.success('Despesa excluída com sucesso!');
        onDeleteSuccess();
      } catch (err) {
        toast.error(err.message || 'Falha ao excluir a despesa.');
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
    return <Alert color="danger">Erro ao carregar despesas: {error.message}</Alert>;
  }

  if (!expenses || expenses.length === 0) {
    return <Alert color="info">Nenhuma despesa encontrada.</Alert>;
  }

  return (
    <>
      <div className="table-responsive">
        <Table className="table-hover align-middle"> 
          <thead className="table-light">
            <tr>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Categoria</th>
              <th>Data</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.description}</td>
                <td>{formatCurrency(expense.amount)}</td>
                <td><span className="badge bg-secondary-subtle text-secondary">{expense.category}</span></td>
                <td>{formatDate(expense.expense_date)}</td>
                <td className="text-end">
                  <Button color="primary" size="sm" className="me-2" onClick={() => onEdit(expense)}>
                    <i className="bx bx-pencil"></i>
                  </Button>
                  <Button color="danger" size="sm" onClick={() => handleDelete(expense.id)}>
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

ExpensesTable.propTypes = {
  expenses: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
  pagination: PropTypes.object,
  onPageChange: PropTypes.func.isRequired,
};

export default ExpensesTable;
