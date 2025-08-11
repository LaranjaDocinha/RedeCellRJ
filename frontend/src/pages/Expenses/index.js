import React, { useState, useEffect, useMemo } from 'react';
import { Container, Button, Card, CardBody, CardTitle, Badge } from 'reactstrap';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import AdvancedTable from '../../components/Common/AdvancedTable';
import { get, post, put, del } from '../../helpers/api_helper';
import useApi from '../../hooks/useApi';
import useNotification from '../../hooks/useNotification';

import ExpenseFormModal from './components/ExpenseFormModal';

const Expenses = () => {
  document.title = 'Controle de Despesas | PDV Web';
  const { showSuccess, showError } = useNotification();

  const [expenses, setExpenses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const { request: fetchExpenses, loading, error } = useApi(get);
  const { request: deleteExpense } = useApi(del);

  const loadExpenses = () => {
    fetchExpenses('/api/finance/expenses')
      .then((response) => {
        if (response) {
          setExpenses(response);
        }
      })
      .catch((err) => {
        showError('Falha ao carregar despesas.');
        console.error(err);
      });
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleEditClick = (expense) => {
    setSelectedExpense(expense);
    setModalOpen(true);
  };

  const handleNewClick = () => {
    setSelectedExpense(null);
    setModalOpen(true);
  };

  const handleDeleteClick = async (expense) => {
    if (window.confirm(`Tem certeza que deseja excluir a despesa de ${expense.description}?`)) {
      try {
        await deleteExpense(`/api/finance/expenses/${expense.id}`);
        showSuccess('Despesa excluída com sucesso!');
        loadExpenses();
      } catch (err) {
        showError('Falha ao excluir despesa.');
        console.error(err);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        header: 'Descrição',
        accessorKey: 'description',
      },
      {
        header: 'Valor',
        accessorKey: 'amount',
        cell: (info) => `R$ ${parseFloat(info.getValue()).toFixed(2)}`,
      },
      {
        header: 'Data',
        accessorKey: 'expense_date',
        cell: (info) => format(new Date(info.getValue()), 'dd/MM/yyyy', { locale: ptBR }),
      },
      {
        header: 'Categoria',
        accessorKey: 'category',
        cell: (info) => <Badge color='secondary'>{info.getValue() || 'N/A'}</Badge>,
      },
      {
        header: 'Método de Pagamento',
        accessorKey: 'payment_method',
        cell: (info) => info.getValue() || 'N/A',
      },
      {
        header: 'Ações',
        cell: ({ row }) => {
          const expense = row.original;
          return (
            <div className='d-flex gap-2'>
              <Button color='primary' size='sm' onClick={() => handleEditClick(expense)}>
                <i className='bx bx-pencil me-1'></i> Editar
              </Button>
              <Button color='danger' size='sm' onClick={() => handleDeleteClick(expense)}>
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
          <Breadcrumbs breadcrumbItem='Despesas' title='Financeiro' />

          <Card>
            <CardBody>
              <CardTitle className='h4 mb-4'>Controle de Despesas</CardTitle>
              <div className='mb-3'>
                <Button color='success' onClick={handleNewClick}>
                  <i className='bx bx-plus me-1'></i> Adicionar Nova Despesa
                </Button>
              </div>
              <AdvancedTable
                columns={columns}
                data={expenses}
                emptyStateActionText={'Adicionar Despesa'}
                emptyStateIcon={''}
                emptyStateMessage={'Nenhuma despesa encontrada.'}
                emptyStateTitle={'Despesas Vazias'}
                loading={loading}
                persistenceKey='expensesTable'
                onEmptyStateActionClick={handleNewClick}
                onRowClick={handleEditClick}
              />
            </CardBody>
          </Card>
        </Container>
      </div>

      <ExpenseFormModal
        expense={selectedExpense}
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        onSave={loadExpenses}
      />
    </React.Fragment>
  );
};

export default Expenses;
