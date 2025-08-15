import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Alert,
  Spinner,
  ModalHeader,
  ModalBody
} from 'reactstrap';
import { useFormik } from 'formik';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import useApi from '../../../../hooks/useApi';
// Removed LoadingSpinner as we'll use reactstrap Spinner

const receivableSchema = z.object({
  description: z.string({ required_error: 'A descrição é obrigatória' }).min(1, 'A descrição é obrigatória'),
  amount: z.preprocess(
    (val) => parseFloat(String(val).replace(",", ".")),
    z.number({ required_error: 'O valor é obrigatório' }).positive('O valor deve ser positivo')
  ),
  dueDate: z.string({ required_error: 'A data de vencimento é obrigatória' }), // Keeping as string for now, as it's an input type="date"
  notes: z.string().nullable().optional(),
  status: z.enum(['pending', 'received', 'overdue'], { required_error: 'O status é obrigatório' }),
});

const ReceivableModal = ({ receivable, onSuccess, onCancel }) => {
  const { request: createReceivable, isLoading: isCreating, error: createError } = useApi('post');
  const { request: updateReceivable, isLoading: isUpdating, error: updateError } = useApi('put');

  const isEditing = !!receivable;
  const isSubmitting = isCreating || isUpdating; // Use combined loading state
  const apiError = createError || updateError; // Use combined error state

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      description: receivable?.description || '',
      amount: receivable?.amount || '',
      dueDate: receivable?.dueDate ? receivable.dueDate.split('T')[0] : '',
      notes: receivable?.notes || '',
      status: receivable?.status || 'pending',
    },
    validate: (values) => {
      try {
        receivableSchema.parse(values);
        return {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.formErrors.fieldErrors;
        }
        return {};
      }
    },
    onSubmit: async (values) => {
      try {
        if (isEditing) {
          await updateReceivable(`/api/finance/receivables/${receivable.id}`, values);
          toast.success('Conta a receber atualizada com sucesso!');
        } else {
          await createReceivable('/api/finance/receivables', values);
          toast.success('Conta a receber adicionada com sucesso!');
        }
        onSuccess(); // Call onSuccess to close modal and refresh list
      } catch (err) {
        toast.error(err.message || 'Erro ao salvar conta a receber.');
      }
    },
  });

  useEffect(() => {
    // Reset form when modal is closed or receivable changes
    if (!isSubmitting && !isEditing) { // Only reset if not submitting and not editing
      validation.resetForm();
    }
  }, [isSubmitting, isEditing, validation.resetForm]); // Depend on isSubmitting and isEditing

  return (
    <Form onSubmit={validation.handleSubmit}>
      <div className="modal-body"> {/* Replaced ModalBody */}
        <FormGroup>
          <Label htmlFor='description'>Descrição</Label>
          <Input
            id='description'
            invalid={!!(validation.touched.description && validation.errors.description)}
            name='description'
            placeholder='Ex: Venda de produto'
            type='text'
            value={validation.values.description}
            onBlur={validation.handleBlur}
            onChange={validation.handleChange}
          />
          <FormFeedback>
            {validation.touched.description && validation.errors.description}
          </FormFeedback>
        </FormGroup>

        <FormGroup>
          <Label htmlFor='amount'>Valor (R$)</Label>
          <Input
            id='amount'
            invalid={!!(validation.touched.amount && validation.errors.amount)}
            name='amount'
            placeholder='Ex: 500.00'
            step='0.01'
            type='number'
            value={validation.values.amount}
            onBlur={validation.handleBlur}
            onChange={validation.handleChange}
          />
          <FormFeedback>{validation.touched.amount && validation.errors.amount}</FormFeedback>
        </FormGroup>

        <FormGroup>
          <Label htmlFor='dueDate'>Data de Vencimento</Label>
          <Input
            id='dueDate'
            invalid={!!(validation.touched.dueDate && validation.errors.dueDate)}
            name='dueDate'
            type='date'
            value={validation.values.dueDate}
            onBlur={validation.handleBlur}
            onChange={validation.handleChange}
          />
          <FormFeedback>{validation.touched.dueDate && validation.errors.dueDate}</FormFeedback>
        </FormGroup>

        <FormGroup>
          <Label htmlFor='notes'>Observação</Label>
          <Input
            id='notes'
            invalid={!!(validation.touched.notes && validation.errors.notes)}
            name='notes'
            placeholder='Notas adicionais...'
            rows='3'
            type='textarea'
            value={validation.values.notes}
            onBlur={validation.handleBlur}
            onChange={validation.handleChange}
          />
          <FormFeedback>{validation.touched.notes && validation.errors.notes}</FormFeedback>
        </FormGroup>

        <FormGroup>
          <Label htmlFor='status'>Status</Label>
          <Input
            id='status'
            invalid={!!(validation.touched.status && validation.errors.status)}
            name='status'
            type='select'
            value={validation.values.status}
            onBlur={validation.handleBlur}
            onChange={validation.handleChange}
          >
            <option value='pending'>Pendente</option>
            <option value='received'>Recebido</option>
            <option value='overdue'>Atrasado</option>
          </Input>
          <FormFeedback>{validation.touched.status && validation.errors.status}</FormFeedback>
        </FormGroup>
        {apiError && <Alert color="danger" className="mt-3">{apiError.message || 'Erro ao salvar conta a receber.'}</Alert>}
      </div> {/* End modal-body */}
      <div className="d-flex justify-content-end gap-2 mt-4"> {/* Replaced ModalFooter */}
        <Button color='secondary' disabled={isSubmitting} type='button' onClick={onCancel}>
          Cancelar
        </Button>
        <Button color='primary' disabled={isSubmitting} type='submit'>
          {isSubmitting ? (
            <motion.div
              animate={{ opacity: 1 }}
              className='d-flex align-items-center justify-content-center'
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Spinner color='light' size="sm" />
              <span className='ms-2'>Salvando...</span>
            </motion.div>
          ) : (
            'Salvar'
          )}
        </Button>
      </div>
    </Form>
  );
};

ReceivableModal.propTypes = {
  receivable: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ReceivableModal;
