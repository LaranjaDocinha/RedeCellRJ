import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Col, Row, Alert, Spinner } from 'reactstrap';
import { Formik, Field, ErrorMessage, FieldArray } from 'formik';
import { z } from 'zod';
import useApi from '../../../hooks/useApi';
import toast from 'react-hot-toast';
import Select from 'react-select';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); // Added definition

const quotationSchema = z.object({
  customer_id: z.number({ required_error: 'O cliente é obrigatório.' }),
  quotation_date: z.string({ required_error: 'A data da cotação é obrigatória.' }), // Keeping as string for now, as it's an input type="date"
  valid_until_date: z.string({ required_error: 'A data de validade é obrigatória.' }), // Keeping as string for now, as it's an input type="date"
  status: z.enum(['Draft', 'Sent', 'Approved', 'Rejected', 'ConvertedToSale'], { required_error: 'O status é obrigatório.' }),
  notes: z.string().nullable().optional(),
  items: z.array(
    z.object({
      description: z.string({ required_error: 'Descrição do item é obrigatória.' }).min(1, 'Descrição do item é obrigatória.'),
      quantity: z.preprocess(
        (val) => parseFloat(String(val).replace(",", ".")),
        z.number({ required_error: 'Quantidade é obrigatória.' }).min(1, 'Quantidade mínima é 1.')
      ),
      unit_price: z.preprocess(
        (val) => parseFloat(String(val).replace(",", ".")),
        z.number({ required_error: 'Preço unitário é obrigatório.' }).min(0.01, 'Preço unitário deve ser positivo.')
      ),
      product_id: z.number().nullable().optional(),
      product_variation_id: z.number().nullable().optional(),
    })
  ).min(1, 'A cotação deve ter pelo menos um item.'),
}).refine(data => {
  if (data.quotation_date && data.valid_until_date) {
    return new Date(data.valid_until_date) >= new Date(data.quotation_date);
  }
  return true;
}, {
  message: 'A data de validade não pode ser anterior à data da cotação.',
  path: ['valid_until_date'],
});

const QuotationFormModal = ({ isOpen, toggle, quotation, onSuccess }) => {
  const { request: createQuotation } = useApi('post');
  const { request: updateQuotation } = useApi('put');
  const { data: customersData } = useApi('/api/customers');
  const { data: productsData } = useApi('/api/products');

  const isEditing = !!quotation;

  const customerOptions = customersData?.customers?.map(c => ({ value: c.id, label: c.name })) || [];
  const productOptions = productsData?.products?.flatMap(p => 
    p.product_variations.map(pv => ({
      value: pv.id,
      label: `${p.name} - ${pv.color ? pv.color + ' ' : ''}${pv.size ? pv.size : ''} (SKU: ${pv.barcode})`,
      product_id: p.id,
      unit_price: pv.price,
    }))
  ) || [];

  const statusOptions = [
    { value: 'Draft', label: 'Rascunho' },
    { value: 'Sent', label: 'Enviado' },
    { value: 'Approved', label: 'Aprovado' },
    { value: 'Rejected', label: 'Rejeitado' },
    { value: 'ConvertedToSale', label: 'Convertido em Venda' },
  ];

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      // Calculate total_amount based on items
      const calculatedTotalAmount = values.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const payload = { ...values, total_amount: calculatedTotalAmount };

      const apiCall = isEditing ? updateQuotation : createQuotation;
      const url = isEditing ? `/api/quotations/${quotation.id}` : '/api/quotations';
      
      await apiCall(url, payload);
      
      toast.success(`Cotação ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);
      onSuccess();
    } catch (error) {
      const message = error.message || 'Ocorreu um erro.';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    customer_id: quotation?.customer_id || '',
    quotation_date: quotation?.quotation_date ? new Date(quotation.quotation_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    valid_until_date: quotation?.valid_until_date ? new Date(quotation.valid_until_date).toISOString().split('T')[0] : '',
    status: quotation?.status || 'Draft',
    notes: quotation?.notes || '',
    items: quotation?.items?.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      product_id: item.product_id || null,
      product_variation_id: item.product_variation_id || null,
    })) || [{ description: '', quantity: 1, unit_price: 0, product_id: null, product_variation_id: null }],
  };

  const validate = (values) => {
    try {
      quotationSchema.parse(values);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.formErrors.fieldErrors;
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="xl">
      <ModalHeader toggle={toggle}>
        {isEditing ? 'Editar Cotação' : 'Adicionar Nova Cotação'}
      </ModalHeader>
      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, errors, values, setFieldValue }) => (
          <Form>
            <ModalBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="customer_id">Cliente</Label>
                    <Select
                      name="customer_id"
                      id="customer_id"
                      options={customerOptions}
                      isClearable
                      placeholder="Selecione o cliente..."
                      onChange={(option) => setFieldValue('customer_id', option ? option.value : '')}
                      value={customerOptions.find(option => option.value === values.customer_id)}
                    />
                    <ErrorMessage name="customer_id" component="div" className="text-danger" />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label for="quotation_date">Data da Cotação</Label>
                    <Field as={Input} type="date" name="quotation_date" id="quotation_date" />
                    <ErrorMessage name="quotation_date" component="div" className="text-danger" />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label for="valid_until_date">Válido Até</Label>
                    <Field as={Input} type="date" name="valid_until_date" id="valid_until_date" />
                    <ErrorMessage name="valid_until_date" component="div" className="text-danger" />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="status">Status</Label>
                    <Select
                      name="status"
                      id="status"
                      options={statusOptions}
                      isClearable={false}
                      onChange={(option) => setFieldValue('status', option.value)}
                      value={statusOptions.find(option => option.value === values.status)}
                    />
                    <ErrorMessage name="status" component="div" className="text-danger" />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="notes">Observações</Label>
                    <Field as={Input} type="textarea" name="notes" id="notes" rows="3" />
                    <ErrorMessage name="notes" component="div" className="text-danger" />
                  </FormGroup>
                </Col>
              </Row>

              <h5 className="mt-4">Itens da Cotação</h5>
              <FieldArray name="items">
                {({ push, remove }) => (
                  <div>
                    {values.items.length > 0 &&
                      values.items.map((item, index) => (
                        <Row key={index} className="mb-3 align-items-end border-bottom pb-3">
                          <Col md={4}>
                            <FormGroup>
                              <Label for={`items.${index}.description`}>Descrição</Label>
                              <Field as={Input} type="text" name={`items.${index}.description`} id={`items.${index}.description`} />
                              <ErrorMessage name={`items.${index}.description`} component="div" className="text-danger" />
                            </FormGroup>
                          </Col>
                          <Col md={2}>
                            <FormGroup>
                              <Label for={`items.${index}.quantity`}>Qtd</Label>
                              <Field as={Input} type="number" name={`items.${index}.quantity`} id={`items.${index}.quantity`} />
                              <ErrorMessage name={`items.${index}.quantity`} component="div" className="text-danger" />
                            </FormGroup>
                          </Col>
                          <Col md={3}>
                            <FormGroup>
                              <Label for={`items.${index}.unit_price`}>Preço Unitário</Label>
                              <Field as={Input} type="number" name={`items.${index}.unit_price`} id={`items.${index}.unit_price`} />
                              <ErrorMessage name={`items.${index}.unit_price`} component="div" className="text-danger" />
                            </FormGroup>
                          </Col>
                          <Col md={2}>
                            <FormGroup>
                              <Label for={`items.${index}.product_variation_id`}>Produto (Opcional)</Label>
                              <Select
                                name={`items.${index}.product_variation_id`}
                                id={`items.${index}.product_variation_id`}
                                options={productOptions}
                                isClearable
                                placeholder="Selecione um produto..."
                                onChange={(option) => {
                                  setFieldValue(`items.${index}.product_id`, option ? option.product_id : null);
                                  setFieldValue(`items.${index}.product_variation_id`, option ? option.value : null);
                                  setFieldValue(`items.${index}.unit_price`, option ? option.unit_price : 0);
                                  setFieldValue(`items.${index}.description`, option ? option.label : '');
                                }}
                                value={productOptions.find(option => option.value === values.items[index].product_variation_id)}
                              />
                            </FormGroup>
                          </Col>
                          <Col md={1} className="d-flex align-items-center">
                            <Button color="danger" size="sm" onClick={() => remove(index)}>
                              <i className="bx bx-trash"></i>
                            </Button>
                          </Col>
                        </Row>
                      ))}
                    <Button color="success" size="sm" onClick={() => push({ description: '', quantity: 1, unit_price: 0, product_id: null, product_variation_id: null })}>
                      <i className="bx bx-plus me-1"></i> Adicionar Item
                    </Button>
                  </div>
                )}
              </FieldArray>

              <Row className="mt-4">
                <Col md={12} className="text-end">
                  <h5>Total: {formatCurrency(values.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0))}</h5>
                </Col>
              </Row>

              {errors.submit && <Alert color="danger">{errors.submit}</Alert>}
            </ModalBody>
            <ModalFooter>
              <Button type="button" color="secondary" onClick={toggle} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" color="primary" disabled={isSubmitting}>
                {isSubmitting ? <Spinner size="sm" /> : 'Salvar'}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

QuotationFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  quotation: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default QuotationFormModal;
