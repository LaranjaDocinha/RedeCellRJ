import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, Label, Input, Col, Row, Alert, Spinner } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import toast from 'react-hot-toast';
import useApi from '../../../hooks/useApi'; // Adjust path as needed

// Validation Schema
const commissionRuleSchema = z.object({
  description: z.string({ required_error: 'A descrição da regra é obrigatória.' }).min(1, 'A descrição da regra é obrigatória.'),
  type: z.enum(['product', 'service', 'salesperson', 'overall_sales'], { required_error: 'O tipo da regra é obrigatório.' }),
  value: z.preprocess(
    (val) => parseFloat(String(val).replace(",", ".")),
    z.number({ required_error: 'O valor é obrigatório.' }).positive('O valor deve ser positivo.')
  ),
  value_type: z.enum(['fixed', 'percentage'], { required_error: 'O tipo de valor é obrigatório.' }),
  condition: z.string().nullable(), // e.g., 'product_id=123', 'min_sales=1000'
});

const CommissionRuleFormModal = ({ rule, onSuccess, onCancel }) => {
  const { handleSubmit, control, register, reset, formState: { errors } } = useForm({
    resolver: zodResolver(commissionRuleSchema),
    defaultValues: {
      description: '',
      type: '',
      value: '',
      value_type: 'fixed',
      condition: '',
    },
  });

  const { request: createRule, isLoading: isCreating, error: createError } = useApi('post');
  const { request: updateRule, isLoading: isUpdating, error: updateError } = useApi('put');

  const isEditing = !!rule;
  const isLoading = isCreating || isUpdating;
  const apiError = createError || updateError;

  useEffect(() => {
    if (isEditing && rule) {
      reset({
        description: rule.description || '',
        type: rule.type || '',
        value: rule.value || '',
        value_type: rule.value_type || 'fixed',
        condition: rule.condition || '',
      });
    } else {
      reset(); // Reset form for new rule
    }
  }, [isEditing, rule, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateRule(`/api/commissions/rules/${rule.id}`, data);
        toast.success('Regra de comissão atualizada com sucesso!');
      } else {
        await createRule('/api/commissions/rules', data);
        toast.success('Regra de comissão criada com sucesso!');
      }
      onSuccess(); // Call onSuccess to close modal and refresh list
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar regra de comissão.');
    }
  };

  const typeOptions = [
    { value: 'product', label: 'Por Produto' },
    { value: 'service', label: 'Por Serviço' },
    { value: 'salesperson', label: 'Por Vendedor' },
    { value: 'overall_sales', label: 'Vendas Totais' },
  ];

  const valueTypeOptions = [
    { value: 'fixed', label: 'Fixo (R$)' },
    { value: 'percentage', label: 'Percentual (%)' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col md={12}>
          <FormGroup>
            <Label for="description">Descrição da Regra</Label>
            <Input
              type="text"
              id="description"
              {...register('description')}
              invalid={!!errors.description}
            />
            {errors.description && <Alert color="danger" className="mt-2">{errors.description.message}</Alert>}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for="type">Tipo de Regra</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={typeOptions}
                  isClearable={false}
                  placeholder="Selecione o tipo..."
                  onChange={(val) => field.onChange(val.value)}
                  value={typeOptions.find(option => option.value === field.value)}
                />
              )}
            />
            {errors.type && <Alert color="danger" className="mt-2">{errors.type.message}</Alert>}
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="value_type">Tipo de Valor</Label>
            <Controller
              name="value_type"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={valueTypeOptions}
                  isClearable={false}
                  placeholder="Selecione o tipo de valor..."
                  onChange={(val) => field.onChange(val.value)}
                  value={valueTypeOptions.find(option => option.value === field.value)}
                />
              )}
            />
            {errors.value_type && <Alert color="danger" className="mt-2">{errors.value_type.message}</Alert>}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for="value">Valor</Label>
            <Input
              type="number"
              id="value"
              {...register('value')}
              invalid={!!errors.value}
              step="0.01"
              min="0"
            />
            {errors.value && <Alert color="danger" className="mt-2">{errors.value.message}</Alert>}
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="condition">Condição (Opcional)</Label>
            <Input
              type="text"
              id="condition"
              {...register('condition')}
              placeholder="Ex: product_id=123 ou min_sales=1000"
            />
          </FormGroup>
        </Col>
      </Row>

      {apiError && <Alert color="danger" className="mt-3">{apiError.message || 'Erro ao salvar regra de comissão.'}</Alert>}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button type="button" color="secondary" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" color="primary" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : (isEditing ? 'Atualizar' : 'Salvar')}
        </Button>
      </div>
    </form>
  );
};

CommissionRuleFormModal.propTypes = {
  rule: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default CommissionRuleFormModal;
