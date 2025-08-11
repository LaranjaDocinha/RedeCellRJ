
import React, { useState, useEffect } from 'react';
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
  Row,
  Col,
} from 'reactstrap';
import toast from 'react-hot-toast';
import axios from 'axios';

import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { post, put, patch, get } from '../../helpers/api_helper'; // Import get for fetching branches
import useApi from '../../hooks/useApi';

const UserFormModal = ({ isOpen, toggle, user, onSave }) => {
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [branches, setBranches] = useState([]); // New state for branches

  const isEditing = user && user.id;

  const { request: requestPassword, loading: loadingPassword } = useApi(patch);
  const { request: fetchBranches, loading: loadingBranches } = useApi(get);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const isLoading = loadingSubmit || loadingPassword || loadingBranches;

  useEffect(() => {
    if (isOpen) {
      // Fetch branches when modal opens
      fetchBranches('/api/branches')
        .then(response => {
          setBranches(response);
        })
        .catch(err => {
          toast.error('Falha ao carregar filiais.');
          console.error(err);
        });

      if (isEditing) {
        setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          branch_id: user.branch_id, // Set user's current branch
          password: '',
          confirmPassword: '',
        });
        setPreviewImage(user.profile_image_url || null);
      } else {
        setFormData({ name: '', email: '', role: 'user', is_active: true, branch_id: '', password: '', confirmPassword: '' });
        setPreviewImage(null);
      }
      setProfileImage(null);
    }
  }, [user, isOpen, isEditing, fetchBranches]);

  useEffect(() => {
    if (profileImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(profileImage);
    } else if (!user?.profile_image_url) {
      setPreviewImage(null);
    }
  }, [profileImage, user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImage' && files && files[0]) {
      setProfileImage(files[0]);
    } else if (name === 'is_active') {
      setFormData((prev) => ({ ...prev, [name]: value === 'true' }));
    } else if (name === 'branch_id') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem.');
      setLoadingSubmit(false);
      return;
    }
    if (!isEditing && !formData.password) {
      toast.error('A senha é obrigatória para novos usuários.');
      setLoadingSubmit(false);
      return;
    }

    const userFormData = new FormData();
    userFormData.append('name', formData.name);
    userFormData.append('role', formData.role);
    userFormData.append('is_active', formData.is_active);
    userFormData.append('branch_id', formData.branch_id); // Append branch_id

    if (!isEditing) {
      userFormData.append('email', formData.email);
      userFormData.append('password', formData.password);
    }

    if (profileImage) {
      userFormData.append('profileImage', profileImage);
    }

    const userUrl = isEditing ? `/api/users/${user.id}` : '/api/users';
    const method = isEditing ? 'put' : 'post';

    try {
      await axios[method](userUrl, userFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true,
      });

      if (isEditing && formData.password) {
        await requestPassword(`/api/users/${user.id}/password`, { password: formData.password });
      }

      toast.success(`Usuário ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      onSave();
      toggle();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao salvar o usuário.';
      toast.error(errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Modal centered isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        {isEditing ? 'Editar Usuário' : 'Criar Novo Usuário'}
      </ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for='name'>Nome Completo</Label>
            <Input
              required
              id='name'
              name='name'
              value={formData.name || ''}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='email'>Email</Label>
            <Input
              required
              disabled={isEditing}
              id='email'
              name='email'
              type='email'
              value={formData.email || ''}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='role'>Cargo</Label>
            <Input
              id='role'
              name='role'
              type='select'
              value={formData.role || 'user'}
              onChange={handleChange}
            >
              <option value='user'>Usuário</option>
              <option value='technician'>Técnico</option>
              <option value='admin'>Administrador</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for='branch_id'>Filial</Label>
            <Input
              id='branch_id'
              name='branch_id'
              type='select'
              value={formData.branch_id || ''}
              onChange={handleChange}
              required
              disabled={loadingBranches}
            >
              <option value="">Selecione a Filial</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Input>
          </FormGroup>
          {isEditing && (
            <FormGroup>
              <Label for='is_active'>Status</Label>
              <Input
                id='is_active'
                name='is_active'
                type='select'
                value={formData.is_active ? 'true' : 'false'}
                onChange={handleChange}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </Input>
            </FormGroup>
          )}
          <FormGroup>
            <Label for='profileImage'>Foto de Perfil</Label>
            <Input
              id='profileImage'
              name='profileImage'
              type='file'
              accept='image/*'
              onChange={handleChange}
            />
            {previewImage && (
              <div className="mt-2">
                <img src={previewImage} alt="Preview" className="img-thumbnail" style={{ maxWidth: '100px', maxHeight: '100px' }} />
              </div>
            )}
          </FormGroup>
          <hr />
          <p className='text-muted'>
            {isEditing
              ? 'Preencha os campos abaixo apenas se desejar alterar a senha.'
              : 'Defina a senha para o novo usuário.'}
          </p>
          <Row>
            <Col>
              <FormGroup>
                <Label for='password'>Senha</Label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  value={formData.password || ''}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <Label for='confirmPassword'>Confirmar Senha</Label>
                <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type='password'
                  value={formData.confirmPassword || ''}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color='secondary' disabled={isLoading} onClick={toggle}>
            Cancelar
          </Button>
          <Button color='primary' disabled={isLoading} type='submit'>
            {isLoading ? <LoadingSpinner size='sm' /> : 'Salvar'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
