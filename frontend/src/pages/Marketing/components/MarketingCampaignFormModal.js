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

import 'flatpickr/dist/themes/material_blue.css'; // Example theme

// Validation Schema
const campaignSchema = z.object({
  name: z.string({ required_error: 'O nome da campanha é obrigatório.' }).min(1, 'O nome da campanha é obrigatório.'),
  type: z.string({ required_error: 'O tipo da campanha é obrigatório.' }).min(1, 'O tipo da campanha é obrigatório.'),
  status: z.string({ required_error: 'O status da campanha é obrigatório.' }).min(1, 'O status da campanha é obrigatório.'),
  start_date: z.date({ required_error: 'A data de início é obrigatória.' }).nullable(),
  end_date: z.date().nullable(),
  budget: z.preprocess(
    (val) => (val ? parseFloat(String(val).replace(",", ".")) : undefined),
    z.number().positive('O orçamento deve ser positivo.').optional()
  ),
  description: z.string().nullable(),
}).refine(data => data.end_date === null || data.end_date === undefined || data.start_date === null || data.start_date === undefined || data.end_date >= data.start_date, {
  message: 'A data de fim não pode ser anterior à data de início.',
  path: ['end_date'],
});

const MarketingCampaignFormModal = ({ campaign, onSuccess, onCancel }) => {
  const { handleSubmit, control, register, reset, formState: { errors } } = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      type: '',
      status: 'draft',
      start_date: null,
      end_date: null,
      budget: '',
      description: '',
    },
  });

  const { request: createCampaign, isLoading: isCreating, error: createError } = useApi('post');
  const { request: updateCampaign, isLoading: isUpdating, error: updateError } = useApi('put');

  const isEditing = !!campaign;
  const isLoading = isCreating || isUpdating;
  const apiError = createError || updateError;

  useEffect(() => {
    if (isEditing && campaign) {
      reset({
        name: campaign.name || '',
        type: campaign.type || '',
        status: campaign.status || 'draft',
        start_date: campaign.start_date ? new Date(campaign.start_date) : null,
        end_date: campaign.end_date ? new Date(campaign.end_date) : null,
        budget: campaign.budget || '',
        description: campaign.description || '',
      });
    } else {
      reset(); // Reset form for new campaign
    }
  }, [isEditing, campaign, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        start_date: data.start_date ? data.start_date.toISOString().split('T')[0] : null,
        end_date: data.end_date ? data.end_date.toISOString().split('T')[0] : null,
      };

      if (isEditing) {
        await updateCampaign(`/api/marketing/campaigns/${campaign.id}`, payload);
        toast.success('Campanha atualizada com sucesso!');
      } else {
        await createCampaign('/api/marketing/campaigns', payload);
        toast.success('Campanha criada com sucesso!');
      }
      onSuccess(); // Call onSuccess to close modal and refresh list
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar campanha.');
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Ativa' },
    { value: 'paused', label: 'Pausada' },
    { value: 'completed', label: 'Concluída' },
    { value: 'draft', label: 'Rascunho' },
  ];

  const typeOptions = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'social_media', label: 'Mídia Social' },
    { value: 'push_notification', label: 'Notificação Push' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col md={12}>
          <FormGroup>
            <Label for="name">Nome da Campanha</Label>
            <Input
              type="text"
              id="name"
              {...register('name')}
              invalid={!!errors.name}
            />
            {errors.name && <Alert color="danger" className="mt-2">{errors.name.message}</Alert>}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for="type">Tipo</Label>
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
            <Label for="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={statusOptions}
                  isClearable={false}
                  placeholder="Selecione o status..."
                  onChange={(val) => field.onChange(val.value)}
                  value={statusOptions.find(option => option.value === field.value)}
                />
              )}
            />
            {errors.status && <Alert color="danger" className="mt-2">{errors.status.message}</Alert>}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for="start_date">Data de Início</Label>
            <Controller
              name="start_date"
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
            {errors.start_date && <Alert color="danger" className="mt-2">{errors.start_date.message}</Alert>}
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="end_date">Data de Fim</Label>
            <Controller
              name="end_date"
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
            {errors.end_date && <Alert color="danger" className="mt-2">{errors.end_date.message}</Alert>}
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <Label for="budget">Orçamento (R$)</Label>
        <Input
          type="number"
          id="budget"
          {...register('budget')}
          invalid={!!errors.budget}
          step="0.01"
          min="0"
        />
        {errors.budget && <Alert color="danger" className="mt-2">{errors.budget.message}</Alert>}
      </FormGroup>
      <FormGroup>
        <Label for="description">Descrição</Label>
        <Input
          type="textarea"
          id="description"
          rows="3"
          {...register('description')}
        />
      </FormGroup>

      {apiError && <Alert color="danger" className="mt-3">{apiError.message || 'Erro ao salvar campanha.'}</Alert>}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button type="button" color="secondary" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" color="primary" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : (isEditing ? 'Atualizar' : 'Salvar')}
        </Button>
      </div>
    </form>
  );
};

MarketingCampaignFormModal.propTypes = {
  campaign: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default MarketingCampaignFormModal;
