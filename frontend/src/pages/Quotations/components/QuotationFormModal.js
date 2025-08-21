import React, { useState, useEffect, useCallback } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Row, Col, Table, Alert, Spinner } from 'reactstrap';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

import useApi from '../../../hooks/useApi';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const quotationSchema = z.object({
  customer_id: z.number({ required_error: 'O cliente é obrigatório.' }),
  quotation_date: z.string({ required_error: 'A data da cotação é obrigatória.' }),
  notes: z.string().nullable(),
  items: z.array(z.object({
    product_id: z.number({ required_error: 'O produto é obrigatório.' }),
    quantity: z.number({ required_error: 'A quantidade é obrigatória.' }).min(1, 'A quantidade deve ser no mínimo 1.'),
    price: z.number({ required_error: 'O preço é obrigatório.' }).positive('O preço deve ser positivo.'),
  })).min(1, 'Adicione pelo menos um item à cotação.'),
});

const QuotationFormModal = ({ isOpen, toggle, quotation, onSuccess, onCancel }) => {
  const isEditing = !!quotation;

  const { handleSubmit, control, register, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      customer_id: '',
      quotation_date: new Date().toISOString().split('T')[0],
      notes: '',
      items: [],
    },
  });

  const { request: createQuotation, isLoading: isCreating } = useApi('post');
  const { request: updateQuotation, isLoading: isUpdating } = useApi('put');
  const { data: customersData, request: fetchCustomers } = useApi('get');
  const { data: productsData, request: fetchProducts } = useApi('get');

  const isLoading = isCreating || isUpdating;

  const customerOptions = customersData?.customers?.map(c => ({ value: c.id, label: c.name })) || [];
  const productOptions = productsData?.products?.flatMap(p =>
    p.variations.map(v => ({
      value: v.id,
      label: `${p.name} (${v.color || 'Padrão'})`,
      price: v.price,
      costPrice: v.cost_price,
      product_id: p.id, // Store original product ID
    }))
  ) || [];

  useEffect(() => {
    fetchCustomers('/api/customers');
    fetchProducts('/api/products?includeVariations=true');
  }, [fetchCustomers, fetchProducts]);

  useEffect(() => {
    if (isOpen && quotation) {
      reset({
        customer_id: quotation.customer_id || '',
        quotation_date: quotation.quotation_date ? new Date(quotation.quotation_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: quotation.notes || '',
        items: quotation.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          // Add other fields if necessary for editing
        })),
      });
    } else if (isOpen) {
      reset(); // Reset form for new quotation
      setValue('quotation_date', new Date().toISOString().split('T')[0]);
      setValue('items', []);
    }
  }, [isOpen, quotation, reset, setValue]);

  const handleAddItem = (selectedOption) => {
    if (!selectedOption) return;
    const existingItemIndex = control._formValues.items.findIndex(item => item.product_id === selectedOption.product_id);
    if (existingItemIndex > -1) {
      toast.error('Este produto já foi adicionado à cotação.');
      return;
    }

    const newItem = {
      product_id: selectedOption.product_id,
      product_name: selectedOption.label, // Store name for display
      quantity: 1,
      price: selectedOption.price || 0,
    };
    setValue('items', [...control._formValues.items, newItem]);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = control._formValues.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setValue('items', updatedItems);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = control._formValues.items.filter((_, i) => i !== index);
    setValue('items', updatedItems);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        quotation_date: data.quotation_date,
        items: data.items.map(item => ({
          product_id: item.product_id,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      };

      if (isEditing) {
        await updateQuotation(`/api/quotations/${quotation.id}`, payload);
        toast.success('Cotação atualizada com sucesso!');
      } else {
        await createQuotation('/api/quotations', payload);
        toast.success('Cotação criada com sucesso!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar cotação.');
    }
  };

  const calculateTotal = useCallback(() => {
    return control._formValues.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  }, [control._formValues.items]);

  return (
    <Modal centered isOpen={isOpen} size='xl' toggle={onCancel}>
      <ModalHeader toggle={onCancel}>
        {isEditing ? 'Editar Cotação' : 'Adicionar Nova Cotação'}
      </ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="customer_id">Cliente</Label>
                <Controller
                  name="customer_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={customerOptions}
                      isLoading={!customersData}
                      isClearable
                      placeholder="Selecione um cliente..."
                      onChange={(val) => field.onChange(val ? val.value : '')}
                      value={customerOptions.find(option => option.value === field.value)}
                    />
                  )}
                />
                {errors.customer_id && <Alert color="danger" className="mt-2">{errors.customer_id.message}</Alert>}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="quotation_date">Data da Cotação</Label>
                <Controller
                  name="quotation_date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      id="quotation_date"
                      {...field}
                      invalid={!!errors.quotation_date}
                    />
                  )}
                />
                {errors.quotation_date && <Alert color="danger" className="mt-2">{errors.quotation_date.message}</Alert>}
              </FormGroup>
            </Col>
          </Row>
          <FormGroup>
            <Label for="notes">Notas (Opcional)</Label>
            <Input
              type="textarea"
              id="notes"
              rows="3"
              {...register('notes')}
            />
          </FormGroup>

          <hr className="my-4" />

          <h5 className="mb-3">Itens da Cotação</h5>
          <FormGroup>
            <Label for="product_search">Adicionar Produto</Label>
            <Select
              options={productOptions}
              isLoading={!productsData}
              isClearable
              placeholder="Buscar produto..."
              onChange={handleAddItem}
            />
          </FormGroup>

          {control._formValues.items.length > 0 ? (
            <Table bordered responsive className="mt-3">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th style={{ width: '120px' }}>Quantidade</th>
                  <th style={{ width: '150px' }}>Preço Unitário</th>
                  <th style={{ width: '150px' }}>Subtotal</th>
                  <th style={{ width: '80px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {control._formValues.items.map((item, index) => (
                  <tr key={item.product_id || index}> {/* Use product_id as key if available, fallback to index */}
                    <td>{item.product_name}</td>
                    <td>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                      />
                    </td>
                    <td>
                      <NumericFormat
                        className="form-control"
                        decimalScale={2}
                        decimalSeparator=','
                        prefix='R$ '
                        thousandSeparator='.'
                        value={item.price}
                        onValueChange={(values) => handleItemChange(index, 'price', values.value)}
                      />
                    </td>
                    <td>
                      <NumericFormat
                        className="form-control-plaintext"
                        decimalScale={2}
                        decimalSeparator=','
                        displayType='text'
                        prefix='R$ '
                        thousandSeparator='.'
                        value={item.quantity * item.price}
                      />
                    </td>
                    <td>
                      <Button color="danger" size="sm" onClick={() => handleRemoveItem(index)}>
                        Remover
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                  <td>
                    <NumericFormat
                      className="form-control-plaintext"
                      decimalScale={2}
                      decimalSeparator=','
                      displayType='text'
                      prefix='R$ '
                      thousandSeparator='.'
                      value={calculateTotal()}
                    />
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </Table>
          ) : (
            <Alert color="info" className="mt-3">Adicione produtos à cotação.</Alert>
          )}
          {errors.items && <Alert color="danger" className="mt-2">{errors.items.message}</Alert>}

        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
          <Button color="primary" type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : (isEditing ? 'Atualizar Cotação' : 'Criar Cotação')}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default QuotationFormModal;