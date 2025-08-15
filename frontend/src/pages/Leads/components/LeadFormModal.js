import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Col, Row, Alert } from 'reactstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';
import Select from 'react-select';

const leadSchema = z.object({
  name: z.string({ required_error: 'O nome é obrigatório.' }).min(1, 'O nome é obrigatório.'),
  email: z.string().email('Email inválido.').nullable().optional(),
  phone: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  status: z.enum(['Novo', 'Qualificado', 'Contato', 'Convertido', 'Perdido'], { required_error: 'O status é obrigatório.' }),
  notes: z.string().nullable().optional(),
});

const LeadFormModal = ({ isOpen, toggle, lead, onSuccess }) => {
  const { request: createLead } = useApi('post');
  const { request: updateLead } = useApi('put');

  const isEditing = !!lead;

  const statusOptions = [
    { value: 'Novo', label: 'Novo' },
    { value: 'Qualificado', label: 'Qualificado' },
    { value: 'Contato', label: 'Contato' },
    { value: 'Convertido', label: 'Convertido' },
    { value: 'Perdido', label: 'Perdido' },
  ];

  const sourceOptions = [
    { value: 'Website', label: 'Website' },
    { value: 'Indicação', label: 'Indicação' },
    { value: 'Telefone', label: 'Telefone' },
    { value: 'Email', label: 'Email' },
    { value: 'Outro', label: 'Outro' },
  ];

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const apiCall = isEditing ? updateLead : createLead;
      const url = isEditing ? `/api/leads/${lead.id}` : '/api/leads';
      
      await apiCall(url, values);
      
      toast.success(`Lead ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
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
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    source: lead?.source || '',
    status: lead?.status || 'Novo',
    notes: lead?.notes || '',
  };

  const validate = (values) => {
    try {
      leadSchema.parse(values);
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        return error.formErrors.fieldErrors;
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>
        {isEditing ? 'Editar Lead' : 'Adicionar Novo Lead'}
      </ModalHeader>
      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, errors, setFieldValue, values }) => (
          <Form>
            <ModalBody>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label for="name">Nome</Label>
                    <Field as={Input} type="text" name="name" id="name" />
                    <ErrorMessage name="name" component="div" className="text-danger" />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="email">Email</Label>
                    <Field as={Input} type="email" name="email" id="email" />
                    <ErrorMessage name="email" component="div" className="text-danger" />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="phone">Telefone</Label>
                    <Field as={Input} type="text" name="phone" id="phone" />
                    <ErrorMessage name="phone" component="div" className="text-danger" />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="source">Origem</Label>
                    <Select
                      name="source"
                      id="source"
                      options={sourceOptions}
                      isClearable
                      placeholder="Selecione a origem..."
                      onChange={(option) => setFieldValue('source', option ? option.value : '')}
                      value={sourceOptions.find(option => option.value === values.source)}
                    />
                    <ErrorMessage name="source" component="div" className="text-danger" />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="status">Status</Label>
                    <Select
                      name="status"
                      id="status"
                      options={statusOptions}
                      isClearable={false}
                      placeholder="Selecione o status..."
                      onChange={(option) => setFieldValue('status', option.value)}
                      value={statusOptions.find(option => option.value === values.status)}
                    />
                    <ErrorMessage name="status" component="div" className="text-danger" />
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

LeadFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  lead: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default LeadFormModal;