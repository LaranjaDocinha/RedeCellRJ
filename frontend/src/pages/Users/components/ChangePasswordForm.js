import React, { useState } from 'react';
import { Form, Label, Input, Button, FormFeedback, Card, CardBody, CardTitle } from 'reactstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import { patch } from '../../../helpers/api_helper';

const ChangePasswordForm = ({ userId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validation = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('A senha atual é obrigatória'),
      newPassword: Yup.string()
        .min(6, 'A nova senha deve ter pelo menos 6 caracteres')
        .required('A nova senha é obrigatória'),
      confirmNewPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'As senhas não coincidem')
        .required('A confirmação da nova senha é obrigatória'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        await patch(`/api/users/${userId}/password`, { password: values.newPassword });
        toast.success('Senha alterada com sucesso!');
        resetForm();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao alterar a senha.');
        console.error('Erro ao alterar senha:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Card className='mt-4'>
      <CardBody>
        <CardTitle className='mb-4'>Alterar Senha</CardTitle>
        <Form onSubmit={validation.handleSubmit}>
          <div className='mb-3'>
            <Label htmlFor='currentPassword'>Senha Atual</Label>
            <Input
              id='currentPassword'
              invalid={!!(validation.touched.currentPassword && validation.errors.currentPassword)}
              name='currentPassword'
              placeholder='Digite sua senha atual'
              type='password'
              value={validation.values.currentPassword || ''}
              onBlur={validation.handleBlur}
              onChange={validation.handleChange}
            />
            {validation.touched.currentPassword && validation.errors.currentPassword && (
              <FormFeedback>{validation.errors.currentPassword}</FormFeedback>
            )}
          </div>

          <div className='mb-3'>
            <Label htmlFor='newPassword'>Nova Senha</Label>
            <Input
              id='newPassword'
              invalid={!!(validation.touched.newPassword && validation.errors.newPassword)}
              name='newPassword'
              placeholder='Digite sua nova senha'
              type='password'
              value={validation.values.newPassword || ''}
              onBlur={validation.handleBlur}
              onChange={validation.handleChange}
            />
            {validation.touched.newPassword && validation.errors.newPassword && (
              <FormFeedback>{validation.errors.newPassword}</FormFeedback>
            )}
          </div>

          <div className='mb-3'>
            <Label htmlFor='confirmNewPassword'>Confirmar Nova Senha</Label>
            <Input
              id='confirmNewPassword'
              invalid={
                !!(validation.touched.confirmNewPassword && validation.errors.confirmNewPassword)
              }
              name='confirmNewPassword'
              placeholder='Confirme sua nova senha'
              type='password'
              value={validation.values.confirmNewPassword || ''}
              onBlur={validation.handleBlur}
              onChange={validation.handleChange}
            />
            {validation.touched.confirmNewPassword && validation.errors.confirmNewPassword && (
              <FormFeedback>{validation.errors.confirmNewPassword}</FormFeedback>
            )}
          </div>

          <div className='text-end'>
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
                  <span className='ms-2'>Alterando...</span>
                </motion.div>
              ) : (
                'Alterar Senha'
              )}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default ChangePasswordForm;
