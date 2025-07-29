import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
} from 'reactstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import useApi from '../../../../hooks/useApi';
import LoadingSpinner from '../../../../components/Common/LoadingSpinner';

const PayableModal = ({ isOpen, toggle, payable, onSave }) => {
  const api = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      description: payable?.description || '',
      amount: payable?.amount || '',
      dueDate: payable?.dueDate ? payable.dueDate.split('T')[0] : '',
      notes: payable?.notes || '',
      status: payable?.status || 'pending',
    },
    validationSchema: Yup.object({
      description: Yup.string().required('A descrição é obrigatória'),
      amount: Yup.number().required('O valor é obrigatório').positive('O valor deve ser positivo'),
      dueDate: Yup.date().required('A data de vencimento é obrigatória'),
      notes: Yup.string().nullable(),
      status: Yup.string().oneOf(['pending', 'paid', 'overdue']).required('O status é obrigatório'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (payable) {
          await api.put(`/finance/payables/${payable.id}`, values);
          toast.success('Conta a pagar atualizada com sucesso!');
        } else {
          await api.post('/finance/payables', values);
          toast.success('Conta a pagar adicionada com sucesso!');
        }
        onSave();
        toggle();
      } catch (err) {
        console.error('Erro ao salvar conta a pagar:', err);
        toast.error(err.response?.data?.message || 'Erro ao salvar conta a pagar.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!isOpen) {
      validation.resetForm();
    }
  }, [isOpen, validation.resetForm]);

  return (
    <Modal centered isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{payable ? 'Editar' : 'Adicionar'} Conta a Pagar</ModalHeader>
      <Form onSubmit={validation.handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label htmlFor='description'>Descrição</Label>
            <Input
              id='description'
              invalid={!!(validation.touched.description && validation.errors.description)}
              name='description'
              placeholder='Ex: Aluguel da loja'
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
              placeholder='Ex: 1500.00'
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
              <option value='paid'>Pago</option>
              <option value='overdue'>Atrasado</option>
            </Input>
            <FormFeedback>{validation.touched.status && validation.errors.status}</FormFeedback>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color='secondary' disabled={isSubmitting} type='button' onClick={toggle}>
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
                <LoadingSpinner color='#fff' size={20} />
                <span className='ms-2'>Salvando...</span>
              </motion.div>
            ) : (
              'Salvar'
            )}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

PayableModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  payable: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export default PayableModal;
