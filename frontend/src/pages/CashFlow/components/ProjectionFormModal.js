import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, Label, Input, Col, Row, Alert, Spinner } from 'reactstrap'; // Removed Modal, ModalHeader, ModalBody, ModalFooter
import { Formik, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import useApi from '../../../hooks/useApi';
import toast from 'react-hot-toast';

const projectionSchema = z.object({
  description: z.string({ required_error: 'A descrição é obrigatória.' }).min(1, 'A descrição é obrigatória.'),
  amount: z.preprocess(
    (val) => parseFloat(String(val).replace(",", ".")),
    z.number({ required_error: 'O valor é obrigatório.' }).positive('O valor deve ser positivo.')
  ),
  type: z.enum(['inflow', 'outflow'], { required_error: 'O tipo é obrigatório.' }),
  projection_date: z.string({ required_error: 'A data é obrigatória.' }), // Keeping as string for now, as it's an input type="date"
  notes: z.string().optional(),
});

// Removed isOpen, toggle from props as they are handled by parent Modal
const ProjectionFormModal = ({ projection, onSuccess, onCancel }) => {
  const { request: createProjection, isLoading: isCreating, error: createError } = useApi('post');
  const { request: updateProjection, isLoading: isUpdating, error: updateError } = useApi('put');

  const isEditing = !!projection;
  const isSubmitting = isCreating || isUpdating; // Use combined loading state
  const apiError = createError || updateError; // Use combined error state

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const apiCall = isEditing ? updateProjection : createProjection;
      const url = isEditing ? `/api/cashflow/projections/${projection.id}` : '/api/cashflow/projections';
      
      await apiCall(url, values);
      
      toast.success(`Projeção ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);
      onSuccess(); // Call onSuccess to close modal and refresh list
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar projeção.');
      setErrors({ submit: err.message || 'Erro ao salvar projeção.' }); // Set formik error
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    description: projection?.description || '',
    amount: projection?.amount || '',
    type: projection?.type || 'outflow',
    projection_date: projection?.projection_date ? new Date(projection.projection_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    notes: projection?.notes || '',
  };

  const validate = (values) => {
    try {
      projectionSchema.parse(values);
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
                <Label for="description">Descrição</Label>
                <Field as={Input} type="text" name="description" id="description" />
                <ErrorMessage name="description" component="div" className="text-danger" />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <FormGroup>
                <Label for="amount">Valor</Label>
                <Field as={Input} type="number" name="amount" id="amount" />
                <ErrorMessage name="amount" component="div" className="text-danger" />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="type">Tipo</Label>
                <Field as={Input} type="select" name="type" id="type">
                  <option value="outflow">Saída</option>
                  <option value="inflow">Entrada</option>
                </Field>
                <ErrorMessage name="type" component="div" className="text-danger" />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="projection_date">Data da Projeção</Label>
                <Field as={Input} type="date" name="projection_date" id="projection_date" />
                <ErrorMessage name="projection_date" component="div" className="text-danger" />
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
          {apiError && <Alert color="danger" className="mt-3">{apiError.message || 'Erro ao salvar projeção.'}</Alert>}
          <div className="d-flex justify-content-end gap-2 mt-4"> {/* Replaced ModalFooter */}
            <Button type="button" color="secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" color="primary" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : 'Salvar'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

ProjectionFormModal.propTypes = {
  projection: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired, // Added onCancel prop
};

export default ProjectionFormModal;