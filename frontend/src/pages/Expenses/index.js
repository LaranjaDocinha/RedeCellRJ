import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Breadcrumb from '../../components/Common/Breadcrumb';
import ExpensesToolbar from './components/ExpensesToolbar';
import ExpensesTable from './components/ExpensesTable';
import ExpenseFormModal from './components/ExpenseFormModal';
import useApi from '../hooks/useApi';

const ExpensesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10 });

  const { data, isLoading, error, request: fetchExpenses } = useApi('get');

  const reFetchExpenses = useCallback(() => {
    fetchExpenses('/api/expenses', { params: filters });
  }, [fetchExpenses, filters]);

  useEffect(() => {
    reFetchExpenses();
  }, [reFetchExpenses]);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    if (modalOpen) {
      setSelectedExpense(null); // Limpa ao fechar
    }
  };

  const handleCreate = () => {
    setSelectedExpense(null);
    setModalOpen(true);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    toggleModal();
    reFetchExpenses();
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumb title="Finanças" breadcrumbItem="Despesas" />
        <Row>
          <Col xs="12">
            <div className="card">
              <div className="card-body">
                <ExpensesToolbar 
                  onFilterChange={handleFilterChange} 
                  onAddClick={handleCreate} 
                />
                <ExpensesTable
                  expenses={data?.expenses || []}
                  isLoading={isLoading}
                  error={error}
                  onEdit={handleEdit}
                  onDeleteSuccess={reFetchExpenses}
                  pagination={{
                    page: data?.page,
                    pages: data?.pages,
                    total: data?.total,
                  }}
                  onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      {modalOpen && (
        <ExpenseFormModal
          isOpen={modalOpen}
          toggle={toggleModal}
          expense={selectedExpense}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default ExpensesPage;
