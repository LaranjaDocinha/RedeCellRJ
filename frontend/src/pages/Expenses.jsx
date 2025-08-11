
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, CardBody, Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Plus, Edit, Trash2 } from 'react-feather';
import toast from 'react-hot-toast';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);

  const toggle = () => {
    setModal(!modal);
    if (isEditing) {
        setIsEditing(false);
        setCurrentExpense(null);
    }
  }

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/expenses', { withCredentials: true });
      setExpenses(response.data);
    } catch (error) {
      toast.error('Falha ao carregar despesas.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAdd = () => {
    setIsEditing(false);
    const today = new Date().toISOString().split('T')[0];
    setCurrentExpense({ description: '', amount: '', expense_date: today, category: '' });
    setModal(true);
  };

  const handleEdit = (expense) => {
    setIsEditing(true);
    // Formata a data para YYYY-MM-DD para o input type="date"
    const formattedExpense = { ...expense, expense_date: new Date(expense.expense_date).toISOString().split('T')[0] };
    setCurrentExpense(formattedExpense);
    setModal(true);
  };

  const handleDelete = async (id) => {
      if (window.confirm('Tem certeza que deseja deletar esta despesa?')) {
          try {
              await axios.delete(`/api/expenses/${id}`, { withCredentials: true });
              toast.success('Despesa deletada com sucesso!');
              fetchExpenses();
          } catch (error) {
              toast.error('Falha ao deletar despesa.');
              console.error(error);
          }
      }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const expenseData = {
        description: e.target.description.value,
        amount: parseFloat(e.target.amount.value),
        expense_date: e.target.expense_date.value,
        category: e.target.category.value,
        branch_id: 1, // Hardcoded para demonstração
    };

    try {
        if (isEditing) {
            await axios.put(`/api/expenses/${currentExpense.id}`, expenseData, { withCredentials: true });
            toast.success('Despesa atualizada com sucesso!');
        } else {
            await axios.post('/api/expenses', expenseData, { withCredentials: true });
            toast.success('Despesa criada com sucesso!');
        }
        fetchExpenses();
        toggle();
    } catch (error) {
        toast.error('Ocorreu um erro.');
        console.error(error);
    }
  };

  return (
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
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div className="table-responsive">
                <table className="table table-hover">
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
                        <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}</td>
                        <td>{new Date(expense.expense_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                        <td>{expense.category}</td>
                        <td>
                        <Button color="light" size="sm" className="me-2" onClick={() => handleEdit(expense)}>
                            <Edit size={16} />
                        </Button>
                        <Button color="light" size="sm" onClick={() => handleDelete(expense.id)}>
                            <Trash2 size={16} />
                        </Button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>{isEditing ? 'Editar Despesa' : 'Adicionar Nova Despesa'}</ModalHeader>
        <ModalBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="description">Descrição</Label>
              <Input id="description" name="description" type="text" defaultValue={currentExpense?.description} required />
            </FormGroup>
            <FormGroup>
              <Label for="amount">Valor</Label>
              <Input id="amount" name="amount" type="number" step="0.01" defaultValue={currentExpense?.amount} required />
            </FormGroup>
            <FormGroup>
              <Label for="expense_date">Data da Despesa</Label>
              <Input id="expense_date" name="expense_date" type="date" defaultValue={currentExpense?.expense_date} required />
            </FormGroup>
            <FormGroup>
              <Label for="category">Categoria</Label>
              <Input id="category" name="category" type="text" defaultValue={currentExpense?.category} placeholder="Ex: Aluguel, Fornecedores, etc."/>
            </FormGroup>
            <Button color="primary" type="submit">Salvar</Button>
          </Form>
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default ExpensesPage;
