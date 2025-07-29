import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Form,
  Label,
  Input,
  Button,
  FormFeedback,
} from 'reactstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuthStore } from '../../store/authStore'; // Importar o store de autenticação
import Tabs from '../../components/Common/Tabs'; // Importar o componente Tabs
import ExpandableSection from '../../components/Common/ExpandableSection'; // Importar o componente ExpandableSection

import './UserProfile.scss';

import ChangePasswordForm from './components/ChangePasswordForm';

const UserProfile = () => {
  document.title = 'Perfil do Usuário | PDV Web';

  const { user, updateUserProfile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profile_image_url || '/redecellrj.png');

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      zip: user?.zip || '',
      bio: user?.bio || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('O nome é obrigatório'),
      email: Yup.string().email('E-mail inválido').required('O e-mail é obrigatório'),
      phone: Yup.string()
        .matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato de telefone inválido (Ex: (XX) XXXXX-XXXX)')
        .nullable(),
      address: Yup.string().nullable(),
      city: Yup.string().nullable(),
      state: Yup.string().nullable(),
      zip: Yup.string()
        .matches(/^\d{5}-\d{3}$/, 'Formato de CEP inválido (Ex: XXXXX-XXX)')
        .nullable(),
      bio: Yup.string().max(200, 'A biografia deve ter no máximo 200 caracteres').nullable(),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('phone', values.phone);
        formData.append('address', values.address);
        formData.append('city', values.city);
        formData.append('state', values.state);
        formData.append('zip', values.zip);
        formData.append('bio', values.bio);

        // Se a imagem foi alterada e é um arquivo (não uma URL base64 antiga)
        if (profileImage && profileImage.startsWith('data:image')) {
          const blob = await fetch(profileImage).then((res) => res.blob());
          formData.append('profileImage', blob, 'profile.png');
        }

        const response = await fetch('/api/users/profile', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao atualizar o perfil.');
        }

        const updatedUserData = await response.json();
        updateUserProfile(updatedUserData); // Atualiza o store com os novos dados
        setProfileImage(updatedUserData.profile_image_url); // Atualiza a imagem exibida
        toast.success('Perfil atualizado com sucesso!');
      } catch (error) {
        toast.error(error.message || 'Erro ao atualizar o perfil.');
        console.error('Erro ao atualizar perfil:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const profileFormContent = useMemo(
    () => (
      <Form onSubmit={validation.handleSubmit}>
        <Row>
          <Col className='mb-2' md='6'>
            <Label htmlFor='name'>Nome</Label>
            <Input
              id='name'
              invalid={!!(validation.touched.name && validation.errors.name)}
              name='name'
              placeholder='Digite seu nome'
              type='text'
              value={validation.values.name || ''}
              onBlur={validation.handleBlur}
              onChange={validation.handleChange}
            />
            {validation.touched.name && validation.errors.name && (
              <small className='text-danger'>
                <i className='bx bx-error-circle me-1'></i>
                {validation.errors.name}
              </small>
            )}
          </Col>
          <Col className='mb-2' md='6'>
            <Label htmlFor='email'>E-mail</Label>
            <Input
              disabled // E-mail geralmente não é editável diretamente
              id='email'
              invalid={!!(validation.touched.email && validation.errors.email)}
              name='email'
              placeholder='Digite seu e-mail'
              type='email'
              value={validation.values.email || ''}
              onBlur={validation.handleBlur}
              onChange={validation.handleChange}
            />
            {validation.touched.email && validation.errors.email && (
              <small className='text-danger'>
                <i className='bx bx-error-circle me-1'></i>
                {validation.errors.email}
              </small>
            )}
          </Col>
        </Row>

        <h5 className='mt-3 mb-2'>Informações de Contato e Endereço</h5>

        <Row>
          <Col className='mb-2' md='6'>
            <Label htmlFor='phone'>Telefone</Label>
            <Input
              id='phone'
              invalid={!!(validation.touched.phone && validation.errors.phone)}
              name='phone'
              placeholder='(XX) XXXXX-XXXX'
              type='text'
              value={validation.values.phone || ''}
              onBlur={validation.handleBlur}
              onChange={validation.handleChange}
            />
            {validation.touched.phone && validation.errors.phone && (
              <small className='text-danger'>
                <i className='bx bx-error-circle me-1'></i>
                {validation.errors.phone}
              </small>
            )}
          </Col>
          <Col className='mb-2' md='6'>
            <Label htmlFor='address'>Endereço</Label>
            <Input
              id='address'
              invalid={!!(validation.touched.address && validation.errors.address)}
              name='address'
              placeholder='Digite seu endereço'
              type='text'
              value={validation.values.address || ''}
              onBlur={validation.handleBlur}
              onChange={validation.handleChange}
            />
            {validation.touched.address && validation.errors.address && (
              <small className='text-danger'>
                <i className='bx bx-error-circle me-1'></i>
                {validation.errors.address}
              </small>
            )}
          </Col>
        </Row>

        <Row>
          <Col className='mb-2' md='4'>
            <Label htmlFor='city'>Cidade</Label>
            <Input
              id='city'
              invalid={!!(validation.touched.city && validation.errors.city)}
              name='city'
              placeholder='Digite sua cidade'
              type='text'
              value={validation.values.city || ''}
              onBlur={validation.handleBlur}
              onChange={validation.handleChange}
            />
            {validation.touched.city && validation.errors.city && (
              <small className='text-danger'>
                <i className='bx bx-error-circle me-1'></i>
                {validation.errors.city}
              </small>
            )}
          </Col>
          <Col className='mb-2' md='4'>
            <Label htmlFor='state'>Estado</Label>
            <Input
              id='state'
              invalid={!!(validation.touched.state && validation.errors.state)}
              name='state'
              placeholder='Digite seu estado'
              type='text'
              value={validation.values.state || ''}
              onBlur={validation.handleBlur}
              onChange={validation.handleChange}
            />
            {validation.touched.state && validation.errors.state && (
              <small className='text-danger'>
                <i className='bx bx-error-circle me-1'></i>
                {validation.errors.state}
              </small>
            )}
          </Col>
          <Col className='mb-2' md='4'>
            <Label htmlFor='zip'>CEP</Label>
            <Input
              id='zip'
              invalid={!!(validation.touched.zip && validation.errors.zip)}
              name='zip'
              placeholder='XXXXX-XXX'
              type='text'
              value={validation.values.zip || ''}
              onBlur={validation.handleBlur}
              onChange={validation.handleChange}
            />
            {validation.touched.zip && validation.errors.zip && (
              <small className='text-danger'>
                <i className='bx bx-error-circle me-1'></i>
                {validation.errors.zip}
              </small>
            )}
          </Col>
        </Row>

        <ExpandableSection title='Biografia'>
          <div className='mb-3'>
            <Label htmlFor='bio'>Biografia</Label>
            <Input
              id='bio'
              invalid={!!(validation.touched.bio && validation.errors.bio)}
              name='bio'
              placeholder='Fale um pouco sobre você...'
              rows='3'
              type='textarea'
              value={validation.values.bio || ''}
              onBlur={validation.handleBlur}
              onChange={validation.handleChange}
            />
            {validation.touched.bio && validation.errors.bio && (
              <small className='text-danger'>
                <i className='bx bx-error-circle me-1'></i>
                {validation.errors.bio}
              </small>
            )}
          </div>
        </ExpandableSection>

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
                <span className='ms-2'>Salvando...</span>
              </motion.div>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </Form>
    ),
    [validation, isSubmitting],
  );

  const tabsData = useMemo(
    () => [
      {
        title: 'Informações do Perfil',
        content: profileFormContent,
      },
      {
        title: 'Alterar Senha',
        content: <ChangePasswordForm userId={user?.id} />,
      },
    ],
    [profileFormContent, user?.id],
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Perfil do Usuário' title='Usuários' />

          <Row>
            <Col lg='12'>
              <Card>
                <CardBody>
                  <div className='d-flex flex-column align-items-center text-center mb-4'>
                    <div className='profile-image-upload-container'>
                      <img
                        alt='Foto de Perfil'
                        className='rounded-circle avatar-md profile-image-preview'
                        src={profileImage}
                      />
                      <Label className='profile-image-upload-icon' htmlFor='profile-image-upload'>
                        <i className='bx bx-camera'></i>
                      </Label>
                      <Input
                        accept='image/*'
                        className='d-none'
                        id='profile-image-upload'
                        type='file'
                        onChange={handleImageChange}
                      />
                    </div>
                    <h4 className='mt-3'>{user?.name}</h4>
                    <p className='text-muted'>{user?.email}</p>
                  </div>

                  <Tabs tabs={tabsData} />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default UserProfile;
