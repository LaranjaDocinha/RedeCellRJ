import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, Label, Input, Col, Row, Alert, Spinner } from 'reactstrap'; // Removed Modal, ModalHeader, ModalBody, ModalFooter
import { Formik, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import useApi from '../../../hooks/useApi';
import toast from 'react-hot-toast';

const expenseSchema = z.object({
  description: z.string({ required_error: 'A descrição é obrigatória.' }).min(1, 'A descrição é obrigatória.'),
  amount: z.preprocess(
    (val) => parseFloat(String(val).replace(",", ".")),
    z.number({ required_error: 'O valor é obrigatório.' }).positive('O valor deve ser positivo.')
  ),
  expense_date: z.string({ required_error: 'A data é obrigatória.' }), // Keeping as string for now, as it's an input type="date"
  category: z.string({ required_error: 'A categoria é obrigatória.' }).min(1, 'A categoria é obrigatória.'),
  payment_method: z.string({ required_error: 'O método de pagamento é obrigatório.' }).min(1, 'O método de pagamento é obrigatório.'),
  notes: z.string().optional(),
});

// Removed isOpen, toggle from props as they are handled by parent Modal
const ExpenseFormModal = ({ expense, onSuccess, onCancel }) => {
  const { request: createExpense } = useApi('post');
  const { request: updateExpense } = useApi('put');

  const isEditing = !!expense;

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const apiCall = isEditing ? updateExpense : createExpense;
      const url = isEditing ? `/api/expenses/${expense.id}` : '/api/expenses';
      
      await apiCall(url, values);
      
      toast.success(`Despesa ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);
      onSuccess(); // Call onSuccess to close modal and refresh list
    } catch (error) {
      const message = error.message || 'Ocorreu um erro.';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    description: expense?.description || '',
    amount: expense?.amount || '',
    expense_date: expense?.expense_date ? new Date(expense.expense_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    category: expense?.category || '',
    payment_method: expense?.payment_method || '',
    notes: expense?.notes || '',
  };

  const validate = (values) => {
    try {
      expenseSchema.parse(values);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.formErrors.fieldErrors;
      }
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, errors }) => (
        <Form>
          <Row>
            <Col md={12}>
              <FormGroup>
                <Label for="description">Descrição</Label>
                <Field as={Input} type="text" name="description" id="description" />
                <ErrorMessage name="description" component="div" className="text-danger" />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="amount">Valor</Label>
                <Field as={Input} type="number" name="amount" id="amount" />
                <ErrorMessage name="amount" component="div" className="text-danger" />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="expense_date">Data da Despesa</Label>
                <Field as={Input} type="date" name="expense_date" id="expense_date" />
                <ErrorMessage name="expense_date" component="div" className="text-danger" />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="category">Categoria</Label>
                <Field as={Input} type="select" name="category" id="category">
                  <option value="">Selecione...</option>
                  <option value="Material de Escritório">Material de Escritório</option>
                  <option value="Salários">Salários</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Outros">Outros</option>
                </Field>
                <ErrorMessage name="category" component="div" className="text-danger" />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="payment_method">Método de Pagamento</Label>
                <Field as={Input} type="select" name="payment_method" id="payment_method">
                   <option value="">Selecione...</option>
                   <option value="Dinheiro">Dinheiro</option>
                   <option value="Cartão de Crédito">Cartão de Crédito</option>
                   <option value="Cartão de Débito">Cartão de Débito</option>
                   <option value="Transferência Bancária">Transferência Bancária</option>
                   <option value="PIX">PIX</option>
                </Field>
                <ErrorMessage name="payment_method" component="div" className="text-danger" />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <FormGroup>
                <Label for="notes">Observações</Label>
                <Field as={Input} type="textarea" name="notes" id="notes" />
                <ErrorMessage name="notes" component="div" className="text-danger" />
              </FormGroup>
            </Col>
          </Row>
          {errors.submit && <Alert color="danger">{errors.submit}</Alert>}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button type="button" color="secondary" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" color="primary" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : 'Salvar'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

ExpenseFormModal.propTypes = {
  expense: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired, // Added onCancel prop
};

export default ExpenseFormModal;
