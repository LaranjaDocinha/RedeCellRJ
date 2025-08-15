
import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardTitle, FormGroup, Label, Input, Button, Spinner } from 'reactstrap';
import useNotification from '../../hooks/useNotification';
import useApi from '../../hooks/useApi';
import { put } from '../../helpers/api_helper';

const ProfileOverviewTab = ({ user, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    job_title: '',
    bio: '',
  });

  const { request: updateProfileApi, loading: updatingProfile } = useApi(put);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        job_title: user.job_title || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfileApi('/api/users/profile', formData);
      showSuccess('Perfil atualizado com sucesso!');
      onProfileUpdate(); // Recarregar dados do perfil no componente pai
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      showError('Falha ao atualizar perfil.');
    }
  };

  return (
    <Card>
      <CardBody>
        <CardTitle className="mb-4">Informações Pessoais</CardTitle>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="name">Nome</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              disabled // Email is usually not editable via profile page
            />
          </FormGroup>
          <FormGroup>
            <Label for="phone_number">Telefone</Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="text"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="job_title">Cargo</Label>
            <Input
              id="job_title"
              name="job_title"
              type="text"
              value={formData.job_title}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="bio">Biografia</Label>
            <Input
              id="bio"
              name="bio"
              type="textarea"
              rows="3"
              value={formData.bio}
              onChange={handleChange}
            />
          </FormGroup>
          <Button color="primary" type="submit" disabled={updatingProfile}>
            {updatingProfile ? <Spinner size="sm" /> : 'Salvar Alterações'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default ProfileOverviewTab;
