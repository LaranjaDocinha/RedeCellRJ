import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Col, Row, Alert } from 'reactstrap';
import { Formik, Field, ErrorMessage, FieldArray } from 'formik';
import { z } from 'zod';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';
import Select from 'react-select';

const templateSchema = z.object({
  name: z.string({ required_error: 'O nome do modelo é obrigatório.' }).min(1, 'O nome do modelo é obrigatório.'),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  items: z.array(
    z.object({
      item_text: z.string({ required_error: 'O texto do item é obrigatório.' }).min(1, 'O texto do item é obrigatório.'),
      response_type: z.enum(['boolean', 'text'], { required_error: 'O tipo de resposta é obrigatório.' }),
    })
  ).min(1, 'Um modelo de checklist deve ter pelo menos um item.'),
});

const ChecklistTemplateFormModal = ({ isOpen, toggle, template, onSuccess }) => {
  const { request: createTemplate } = useApi('post');
  const { request: updateTemplate } = useApi('put');

  const isEditing = !!template;

  const categoryOptions = [
    { value: 'Reparo de Celular', label: 'Reparo de Celular' },
    { value: 'Manutenção de Notebook', label: 'Manutenção de Notebook' },
    { value: 'Instalação de Software', label: 'Instalação de Software' },
    { value: 'Outro', label: 'Outro' },
  ];

  const responseTypeOptions = [
    { value: 'boolean', label: 'Sim/Não' },
    { value: 'text', label: 'Texto Livre' },
  ];

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const apiCall = isEditing ? updateTemplate : createTemplate;
      const url = isEditing ? `/api/checklists/templates/${template.id}` : '/api/checklists/templates';
      
      await apiCall(url, values);
      
      toast.success(`Modelo de checklist ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
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
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || '',
    items: template?.items?.map(item => ({
      item_text: item.item_text,
      response_type: item.response_type,
    })) || [{ item_text: '', response_type: 'boolean' }],
  };

  const validate = (values) => {
    try {
      templateSchema.parse(values);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.formErrors.fieldErrors;
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="xl">
      <ModalHeader toggle={toggle}>
        {isEditing ? 'Editar Modelo de Checklist' : 'Adicionar Novo Modelo de Checklist'}
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
                    <Label for="name">Nome do Modelo</Label>
                    <Field as={Input} type="text" name="name" id="name" />
                    <ErrorMessage name="name" component="div" className="text-danger" />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="category">Categoria</Label>
                    <Select
                      name="category"
                      id="category"
                      options={categoryOptions}
                      isClearable
                      placeholder="Selecione a categoria..."
                      onChange={(option) => setFieldValue('category', option ? option.value : '')}
                      value={categoryOptions.find(option => option.value === values.category)}
                    />
                    <ErrorMessage name="category" component="div" className="text-danger" />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label for="description">Descrição</Label>
                    <Field as={Input} type="textarea" name="description" id="description" rows="3" />
                    <ErrorMessage name="description" component="div" className="text-danger" />
                  </FormGroup>
                </Col>
              </Row>

              <h5 className="mt-4">Itens do Checklist</h5>
              <FieldArray name="items">
                {({ push, remove }) => (
                  <div>
                    {values.items.length > 0 &&
                      values.items.map((item, index) => (
                        <Row key={index} className="mb-3 align-items-end border-bottom pb-3">
                          <Col md={6}>
                            <FormGroup>
                              <Label for={`items.${index}.item_text`}>Texto do Item</Label>
                              <Field as={Input} type="text" name={`items.${index}.item_text`} id={`items.${index}.item_text`} />
                              <ErrorMessage name={`items.${index}.item_text`} component="div" className="text-danger" />
                            </FormGroup>
                          </Col>
                          <Col md={4}>
                            <FormGroup>
                              <Label for={`items.${index}.response_type`}>Tipo de Resposta</Label>
                              <Select
                                name={`items.${index}.response_type`}
                                id={`items.${index}.response_type`}
                                options={responseTypeOptions}
                                isClearable={false}
                                onChange={(option) => setFieldValue(`items.${index}.response_type`, option.value)}
                                value={responseTypeOptions.find(option => option.value === values.items[index].response_type)}
                              />
                              <ErrorMessage name={`items.${index}.response_type`} component="div" className="text-danger" />
                            </FormGroup>
                          </Col>
                          <Col md={2} className="d-flex align-items-center">
                            <Button color="danger" size="sm" onClick={() => remove(index)}>
                              <i className="bx bx-trash"></i>
                            </Button>
                          </Col>
                        </Row>
                      ))}
                    <Button color="success" size="sm" onClick={() => push({ item_text: '', response_type: 'boolean' })}>
                      <i className="bx bx-plus me-1"></i> Adicionar Item
                    </Button>
                  </div>
                )}
              </FieldArray>

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

ChecklistTemplateFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  template: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};

export default ChecklistTemplateFormModal;
