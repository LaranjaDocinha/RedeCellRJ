import { z } from 'zod';
import { useFormik } from 'formik';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import { patch } from '../../../helpers/api_helper';

const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'A senha atual é obrigatória' }).min(1, 'A senha atual é obrigatória'),
  newPassword: z.string({ required_error: 'A nova senha é obrigatória' }).min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
  confirmNewPassword: z.string({ required_error: 'A confirmação da nova senha é obrigatória' }).min(1, 'A confirmação da nova senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmNewPassword'],
});

const ChangePasswordForm = ({ userId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validation = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validate: (values) => {
      try {
        changePasswordSchema.parse(values);
        return {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.formErrors.fieldErrors;
        }
        return {};
      }
    },
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
