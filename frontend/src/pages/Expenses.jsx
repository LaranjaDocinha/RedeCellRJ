import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Modal, ModalHeader, ModalBody, Alert, Spinner, Table } from 'reactstrap';
import { Plus, Edit, Trash2 } from 'react-feather';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import useApi from '../hooks/useApi'; // Adjust path as needed

import ExpenseFormModal from './Expenses/components/ExpenseFormModal'; // Will create/refactor this

import './Expenses.scss'; // Page-specific styling

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [modal, setModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [refreshList, setRefreshList] = useState(false); // State to trigger list refresh

  const { request: fetchExpensesApi, isLoading, error } = useApi('get');
  const { request: deleteExpenseApi, isLoading: isDeleting } = useApi('delete');

  const loadExpenses = useCallback(async () => {
    try {
      const response = await fetchExpensesApi('/api/expenses');
      setExpenses(response || []);
    } catch (err) {
      toast.error('Falha ao carregar despesas.');
    }
  }, [fetchExpensesApi]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses, refreshList]); // Refresh when refreshList changes

  const toggle = () => {
    setModal(!modal);
    if (isEditing) {
      setIsEditing(false);
      setCurrentExpense(null);
    }
  };

  const handleAdd = () => {
    setIsEditing(false);
    const today = new Date().toISOString().split('T')[0];
    setCurrentExpense({ description: '', amount: '', expense_date: today, category: '' });
    setModal(true);
  };

  const handleEdit = (expense) => {
    setIsEditing(true);
    const formattedExpense = { ...expense, expense_date: new Date(expense.expense_date).toISOString().split('T')[0] };
    setCurrentExpense(formattedExpense);
    setModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta despesa?')) {
      try {
        await deleteExpenseApi(`/api/expenses/${id}`);
        toast.success('Despesa deletada com sucesso!');
        setRefreshList(prev => !prev); // Trigger list refresh
      } catch (err) {
        toast.error('Falha ao deletar despesa.');
      }
    }
  };

  const handleFormSuccess = () => {
    setRefreshList(prev => !prev); // Trigger list refresh
    toggle(); // Close modal
  };

  return (
    <motion.div
      className="expenses-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col>
            <h2 className="mb-0">Gestão de Despesas</h2>
          </Col>
          <Col className="text-end">
            <Button color="primary" onClick={handleAdd}>
              <Plus size={18} className="me-1" /> Adicionar Despesa
            </Button>
          </Col>
        </Row>

        <Card>
          <CardBody>
            {isLoading ? (
              <div className="text-center"><Spinner /> Carregando despesas...</div>
            ) : error ? (
              <Alert color="danger">Erro ao carregar despesas: {error.message}</Alert>
            ) : expenses && expenses.length > 0 ? (
              <div className="table-responsive">
                <Table className="table-hover table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Categoria</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(expense => (
                      <tr key={expense.id}>
                        <td>{expense.description}</td>
                        <td>{formatCurrency(expense.amount)}</td>
                        <td>{new Date(expense.expense_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                        <td>{expense.category}</td>
                        <td>
                          <Button color="light" size="sm" className="me-2" onClick={() => handleEdit(expense)}>
                            <Edit size={16} />
                          </Button>
                          <Button color="light" size="sm" onClick={() => handleDelete(expense.id)} disabled={isDeleting}>
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <Alert color="info" className="text-center">Nenhuma despesa encontrada.</Alert>
            )}
          </CardBody>
        </Card>

        <Modal isOpen={modal} toggle={toggle} centered size="lg">
          <ModalHeader toggle={toggle}>{isEditing ? 'Editar Despesa' : 'Adicionar Nova Despesa'}</ModalHeader>
          <ModalBody>
            <ExpenseFormModal
              expense={currentExpense}
              onSuccess={handleFormSuccess}
              onCancel={toggle}
            />
          </ModalBody>
        </Modal>
      </Container>
    </motion.div>
  );
};

export default ExpensesPage;