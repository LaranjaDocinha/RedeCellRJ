import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Spinner, Row, Col } from 'reactstrap';
import { post, put, patch } from '../../helpers/api_helper';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi';

const UserFormModal = ({ isOpen, toggle, user, onSave }) => {
  const [formData, setFormData] = useState({});
  
  const { request: requestUser, loading: loadingUser } = useApi(isEditing ? put : post);
  const { request: requestPassword, loading: loadingPassword } = useApi(patch);

  const isEditing = user && user.id;
  const isLoading = loadingUser || loadingPassword;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          password: '',
          confirmPassword: ''
        });
      } else {
        setFormData({ name: '', email: '', role: 'seller', password: '', confirmPassword: '' });
      }
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (!isEditing && !formData.password) {
      toast.error("A senha é obrigatória para novos usuários.");
      return;
    }

    const userPayload = {
      name: formData.name,
      role: formData.role,
      is_active: formData.is_active,
    };
    
    if (!isEditing) {
        userPayload.email = formData.email;
        userPayload.password = formData.password;
    }

    const userUrl = isEditing ? `/users/${user.id}` : '/users';

    try {
      await requestUser(userUrl, userPayload);
      
      if (isEditing && formData.password) {
        await requestPassword(`/users/${user.id}/password`, { password: formData.password });
      }
      
      toast.success(`Usuário ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      onSave();
      toggle();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Ocorreu um erro ao salvar o usuário.";
      toast.error(errorMessage);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>
        {isEditing ? 'Editar Usuário' : 'Criar Novo Usuário'}
      </ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for="name">Nome Completo</Label>
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required disabled={isEditing} />
          </FormGroup>
          <FormGroup>
            <Label for="role">Cargo</Label>
            <Input id="role" name="role" type="select" value={formData.role || 'seller'} onChange={handleChange}>
              <option value="seller">Vendedor</option>
              <option value="admin">Administrador</option>
            </Input>
          </FormGroup>
          <hr />
          <p className="text-muted">{isEditing ? "Preencha os campos abaixo apenas se desejar alterar a senha." : "Defina a senha para o novo usuário."}</p>
          <Row>
            <Col>
              <FormGroup>
                <Label for="password">Senha</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <Label for="confirmPassword">Confirmar Senha</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={isLoading}>Cancelar</Button>
          <Button color="primary" type="submit" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : 'Salvar'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default UserFormModal;