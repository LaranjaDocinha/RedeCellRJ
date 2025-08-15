import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Spinner, Alert } from 'reactstrap';
import { Formik, Field, FieldArray, ErrorMessage } from 'formik';
import { z } from 'zod';
import { Plus, Trash2 } from 'react-feather';

const checklistTemplateSchema = z.object({
  name: z.string({ required_error: 'O nome do template é obrigatório.' }).min(1, 'O nome do template é obrigatório.'),
  description: z.string().optional(),
  category: z.string().optional(),
  items: z.array(
    z.object({
      item_text: z.string({ required_error: 'O texto do item é obrigatório.' }).min(1, 'O texto do item é obrigatório.'),
      response_type: z.enum(['boolean', 'text'], { required_error: 'O tipo de resposta é obrigatório.' }),
    })
  ).min(1, 'O template deve ter pelo menos um item.'),
});

const ChecklistTemplateForm = ({ isOpen, toggle, template, onSave }) => {
  const initialValues = {
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || '',
    items: template?.items || [{ item_text: '', response_type: 'boolean' }],
  };

  const validate = (values) => {
    try {
      checklistTemplateSchema.parse(values);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.formErrors.fieldErrors;
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={(values, { setSubmitting }) => {
          onSave(values);
          setSubmitting(false);
          toggle();
        }}
        enableReinitialize
      >
        {({ values, isSubmitting, handleSubmit, errors, touched }) => (
          <Form onSubmit={handleSubmit}>
            <ModalHeader toggle={toggle}>
              {template ? 'Editar Template de Checklist' : 'Criar Novo Template de Checklist'}
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label for="name">Nome do Template</Label>
                <Field as={Input} type="text" name="name" id="name" />
                <ErrorMessage name="name" component="div" className="text-danger" />
              </FormGroup>
              <FormGroup>
                <Label for="description">Descrição (Opcional)</Label>
                <Field as={Input} type="textarea" name="description" id="description" />
              </FormGroup>
              <FormGroup>
                <Label for="category">Categoria (Opcional)</Label>
                <Field as={Input} type="text" name="category" id="category" placeholder="Ex: Troca de Tela, Reparo de Bateria" />
              </FormGroup>

              <hr />

              <h5>Itens do Checklist</h5>
              <FieldArray name="items">
                {({ push, remove }) => (
                  <div>
                    {values.items.map((item, index) => (
                      <div key={index} className="d-flex align-items-center mb-2 p-2 border rounded">
                        <div className="flex-grow-1">
                          <FormGroup>
                            <Label for={`items.${index}.item_text`}>Texto do Item</Label>
                            <Field as={Input} type="text" name={`items.${index}.item_text`} />
                            <ErrorMessage name={`items.${index}.item_text`} component="div" className="text-danger" />
                          </FormGroup>
                          <FormGroup>
                            <Label for={`items.${index}.response_type`}>Tipo de Resposta</Label>
                            <Field as={Input} type="select" name={`items.${index}.response_type`}>
                              <option value="boolean">Sim/Não</option>
                              <option value="text">Texto</option>
                            </Field>
                          </FormGroup>
                        </div>
                        <Button color="danger" outline className="ms-2" onClick={() => remove(index)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                    <Button color="secondary" onClick={() => push({ item_text: '', response_type: 'boolean' })}>
                      <Plus size={16} className="me-1" /> Adicionar Item
                    </Button>
                  </div>
                )}
              </FieldArray>
              {typeof errors.items === 'string' && <div className="text-danger mt-2">{errors.items}</div>}

            </ModalBody>
            <ModalFooter>
              <Button color="light" onClick={toggle}>Cancelar</Button>
              <Button color="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner size="sm" /> : 'Salvar'}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ChecklistTemplateForm;
