import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';
import { NumericFormat } from 'react-number-format';

import useApi from '../../../hooks/useApi';
import { post, put } from '../../../helpers/api_helper';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import useNotification from '../../../hooks/useNotification';

const ExpenseFormModal = ({ isOpen, toggle, expense, onSave }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    expense_date: '',
    category: '',
    payment_method: '',
    notes: '',
  });

  const { request: createExpense, loading: creating } = useApi(post);
  const { request: updateExpense, loading: updating } = useApi(put);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount || '',
        expense_date: expense.expense_date ? expense.expense_date.split('T')[0] : '',
        category: expense.category || '',
        payment_method: expense.payment_method || '',
        notes: expense.notes || '',
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0], // Data atual por padrão
        category: '',
        payment_method: '',
        notes: '',
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (expense) {
        await updateExpense(`/api/finance/expenses/${expense.id}`, formData);
        showSuccess('Despesa atualizada com sucesso!');
      } else {
        await createExpense('/api/finance/expenses', formData);
        showSuccess('Despesa criada com sucesso!');
      }
      onSave();
      toggle();
    } catch (err) {
      showError(`Falha ao salvar despesa: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <Modal centered isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        {expense ? 'Editar Despesa' : 'Adicionar Nova Despesa'}
      </ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for='description'>Descrição</Label>
            <Input
              required
              id='description'
              name='description'
              placeholder='Ex: Aluguel do mês, Compra de material'
              value={formData.description}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='amount'>Valor (R$)</Label>
            <NumericFormat
              required
              className='form-control'
              decimalSeparator=','
              name='amount'
              prefix='R$ '
              thousandSeparator='.'
              value={formData.amount}
              onValueChange={(values) =>
                handleChange({
                  target: { name: 'amount', value: values.floatValue || '' },
                })
              }
            />
          </FormGroup>
          <FormGroup>
            <Label for='expense_date'>Data da Despesa</Label>
            <Input
              required
              id='expense_date'
              name='expense_date'
              type='date'
              value={formData.expense_date}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='category'>Categoria</Label>
            <Input
              id='category'
              name='category'
              placeholder='Ex: Aluguel, Salários, Marketing'
              type='text'
              value={formData.category}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='payment_method'>Método de Pagamento</Label>
            <Input
              id='payment_method'
              name='payment_method'
              placeholder='Ex: Dinheiro, Cartão de Crédito'
              type='text'
              value={formData.payment_method}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup className='mb-0'>
            <Label for='notes'>Notas</Label>
            <Input
              id='notes'
              name='notes'
              rows='3'
              type='textarea'
              value={formData.notes}
              onChange={handleChange}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color='secondary' disabled={creating || updating} onClick={toggle}>
            Cancelar
          </Button>
          <Button color='primary' disabled={creating || updating} type='submit'>
            {creating || updating ? <LoadingSpinner size='sm' /> : 'Salvar'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ExpenseFormModal;
