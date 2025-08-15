import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, Label, Input, Col, Row, Alert, Spinner } from 'reactstrap'; // Removed Modal, ModalHeader, ModalBody, ModalFooter
import { Formik, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import useApi from '../../../hooks/useApi';
import toast from 'react-hot-toast';

const accountSchema = z.object({
  name: z.string({ required_error: 'O nome da conta é obrigatório.' }).min(1, 'O nome da conta é obrigatório.'),
  bank_name: z.string({ required_error: 'O nome do banco é obrigatório.' }).min(1, 'O nome do banco é obrigatório.'),
  account_number: z.string({ required_error: 'O número da conta é obrigatório.' }).min(1, 'O número da conta é obrigatório.'),
  initial_balance: z.preprocess(
    (val) => parseFloat(String(val).replace(",", ".")),
    z.number({ required_error: 'O saldo inicial é obrigatório.' }).min(0, 'O saldo inicial não pode ser negativo.')
  ),
});

// Removed isOpen, toggle from props as they are handled by parent Modal
const BankAccountFormModal = ({ account, onSuccess, onCancel }) => {
  const { request: createAccount, isLoading: isCreating, error: createError } = useApi('post');
  const { request: updateAccount, isLoading: isUpdating, error: updateError } = useApi('put');

  const isEditing = !!account;
  const isLoading = isCreating || isUpdating;
  const apiError = createError || updateError;

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const apiCall = isEditing ? updateAccount : createAccount;
      const url = isEditing ? `/api/bank-accounts/${account.id}` : '/api/bank-accounts';
      
      await apiCall(url, values);
      
      toast.success(`Conta ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);
      onSuccess(); // Call onSuccess to close modal and refresh list
    } catch (err) {
      const message = err.message || 'Ocorreu um erro.';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    name: account?.name || '',
    bank_name: account?.bank_name || '',
    account_number: account?.account_number || '',
    initial_balance: account?.initial_balance || 0,
  };

  const validate = (values) => {
    try {
      accountSchema.parse(values);
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
      {({ isSubmitting: formikIsSubmitting, errors }) => ( // Renamed isSubmitting to formikIsSubmitting to avoid conflict
        <Form>
          <Row>
            <Col md={12}>
              <FormGroup>
                <Label for="name">Nome da Conta (Apelido)</Label>
                <Field as={Input} type="text" name="name" id="name" placeholder="Ex: Conta Principal" />
                <ErrorMessage name="name" component="div" className="text-danger" />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <FormGroup>
                <Label for="bank_name">Nome do Banco</Label>
                <Field as={Input} type="text" name="bank_name" id="bank_name" />
                <ErrorMessage name="bank_name" component="div" className="text-danger" />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="account_number">Número da Conta</Label>
                <Field as={Input} type="text" name="account_number" id="account_number" />
                <ErrorMessage name="account_number" component="div" className="text-danger" />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="initial_balance">Saldo Inicial (R$)</Label>
                <Field as={Input} type="number" name="initial_balance" id="initial_balance" />
                <ErrorMessage name="initial_balance" component="div" className="text-danger" />
              </FormGroup>
            </Col>
          </Row>
          {apiError && <Alert color="danger" className="mt-3">{apiError.message || 'Erro ao salvar conta bancária.'}</Alert>}
          <div className="d-flex justify-content-end gap-2 mt-4"> {/* Replaced ModalFooter */}
            <Button type="button" color="secondary" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" color="primary" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Salvar'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

BankAccountFormModal.propTypes = {
  account: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired, // Added onCancel prop
};

export default BankAccountFormModal;