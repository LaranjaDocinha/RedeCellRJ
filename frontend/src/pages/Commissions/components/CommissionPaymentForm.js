import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, Label, Input, Col, Row, Alert, Spinner } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import toast from 'react-hot-toast';
import useApi from '../../../hooks/useApi'; // Adjust path as needed

import 'flatpickr/dist/themes/material_blue.css'; // Example theme

// Validation Schema
const paymentSchema = z.object({
  salesperson_id: z.string({ required_error: 'O vendedor/técnico é obrigatório.' }).min(1, 'O vendedor/técnico é obrigatório.'),
  amount: z.preprocess(
    (val) => parseFloat(String(val).replace(",", ".")),
    z.number({ required_error: 'O valor é obrigatório.' }).positive('O valor deve ser positivo.')
  ),
  payment_date: z.date({ required_error: 'A data do pagamento é obrigatória.' }).nullable(),
  payment_method: z.string({ required_error: 'O método de pagamento é obrigatório.' }).min(1, 'O método de pagamento é obrigatório.'),
  notes: z.string().nullable(),
});

const CommissionPaymentForm = ({ payment, onSuccess, onCancel }) => {
  const { handleSubmit, control, register, reset, formState: { errors } } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      salesperson_id: '',
      amount: '',
      payment_date: null,
      payment_method: '',
      notes: '',
    },
  });

  const { request: createPayment, isLoading: isCreating, error: createError } = useApi('post');
  const { request: updatePayment, isLoading: isUpdating, error: updateError } = useApi('put');
  const { data: salespersonsData, isLoading: loadingSalespersons, error: salespersonsError, request: fetchSalespersons } = useApi('get');

  const isEditing = !!payment;
  const isLoading = isCreating || isUpdating;
  const apiError = createError || updateError || salespersonsError;

  const salespersonOptions = salespersonsData?.users?.map(s => ({ value: s.id, label: s.name })) || [];
  const paymentMethodOptions = [
    { value: 'Dinheiro', label: 'Dinheiro' },
    { value: 'Cartão de Crédito', label: 'Cartão de Crédito' },
    { value: 'Cartão de Débito', label: 'Cartão de Débito' },
    { value: 'Transferência Bancária', label: 'Transferência Bancária' },
    { value: 'PIX', label: 'PIX' },
  ];

  useEffect(() => {
    fetchSalespersons('/api/users?role=salesperson');
  }, [fetchSalespersons]);

  useEffect(() => {
    if (isEditing && payment) {
      reset({
        salesperson_id: payment.salesperson_id || '',
        amount: payment.amount || '',
        payment_date: payment.payment_date ? new Date(payment.payment_date) : null,
        payment_method: payment.payment_method || '',
        notes: payment.notes || '',
      });
    } else {
      reset(); // Reset form for new payment
    }
  }, [isEditing, payment, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        payment_date: data.payment_date ? data.payment_date.toISOString().split('T')[0] : null,
      };

      if (isEditing) {
        await updatePayment(`/api/commissions/payments/${payment.id}`, payload);
        toast.success('Pagamento atualizado com sucesso!');
      } else {
        await createPayment('/api/commissions/payments', payload);
        toast.success('Pagamento registrado com sucesso!');
      }
      onSuccess(); // Call onSuccess to close modal and refresh list
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar pagamento.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col md={12}>
          <FormGroup>
            <Label for="salesperson_id">Vendedor/Técnico</Label>
            <Controller
              name="salesperson_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={salespersonOptions}
                  isLoading={loadingSalespersons}
                  isClearable={false}
                  placeholder="Selecione o vendedor/técnico..."
                  onChange={(val) => field.onChange(val ? val.value : '')}
                  value={salespersonOptions.find(option => option.value === field.value)}
                />
              )}
            />
            {errors.salesperson_id && <Alert color="danger" className="mt-2">{errors.salesperson_id.message}</Alert>}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for="amount">Valor (R$)</Label>
            <Input
              type="number"
              id="amount"
              {...register('amount')}
              invalid={!!errors.amount}
              step="0.01"
              min="0"
            />
            {errors.amount && <Alert color="danger" className="mt-2">{errors.amount.message}</Alert>}
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="payment_date">Data do Pagamento</Label>
            <Controller
              name="payment_date"
              control={control}
              render={({ field }) => (
                <Flatpickr
                  className="form-control d-block"
                  options={{ dateFormat: 'Y-m-d' }}
                  value={field.value}
                  onChange={([date]) => field.onChange(date)}
                />
              )}
            />
            {errors.payment_date && <Alert color="danger" className="mt-2">{errors.payment_date.message}</Alert>}
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <Label for="payment_method">Método de Pagamento</Label>
        <Controller
          name="payment_method"
          control={control}
          render={({ field }) => (
                <Select
                  {...field}
                  options={paymentMethodOptions}
                  isClearable={false}
                  placeholder="Selecione o método..."
                  onChange={(val) => field.onChange(val.value)}
                  value={paymentMethodOptions.find(option => option.value === field.value)}
                />
              )}
            />
        {errors.payment_method && <Alert color="danger" className="mt-2">{errors.payment_method.message}</Alert>}
      </FormGroup>
      <FormGroup>
        <Label for="notes">Notas (Opcional)</Label>
        <Input
          type="textarea"
          id="notes"
          rows="3"
          {...register('notes')}
        />
      </FormGroup>

      {apiError && <Alert color="danger" className="mt-3">{apiError.message || 'Erro ao salvar pagamento.'}</Alert>}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button type="button" color="secondary" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" color="primary" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : (isEditing ? 'Atualizar' : 'Registrar')}
        </Button>
      </div>
    </form>
  );
};

CommissionPaymentForm.propTypes = {
  payment: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default CommissionPaymentForm;