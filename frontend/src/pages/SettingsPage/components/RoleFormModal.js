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
} from 'reactstrap';

import useNotification from '../../../hooks/useNotification';
import useApi from '../../../hooks/useApi';
import { post, put } from '../../../helpers/api_helper';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const RoleFormModal = ({ isOpen, toggle, role, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const { request: createRole, loading: creating } = useApi(post);
  const { request: updateRole, loading: updating } = useApi(put);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (role) {
        await updateRole(`/api/roles/${role.id}`, formData);
        showSuccess('Papel atualizado com sucesso!');
      } else {
        await createRole('/api/roles', formData);
        showSuccess('Papel criado com sucesso!');
      }
      onSave();
      toggle();
    } catch (err) {
      showError(`Falha ao salvar papel: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <Modal centered isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{role ? 'Editar Papel' : 'Adicionar Novo Papel'}</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for='name'>Nome do Papel</Label>
            <Input
              required
              id='name'
              name='name'
              placeholder='Ex: Administrador'
              value={formData.name}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup className='mb-0'>
            <Label for='description'>Descrição</Label>
            <Input
              id='description'
              name='description'
              placeholder='Descreva as responsabilidades deste papel'
              rows='3'
              type='textarea'
              value={formData.description}
              onChange={handleChange}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color='secondary' disabled={creating || updating} onClick={toggle}>
            Cancelar
          </Button>
          <Button color='primary' disabled={creating || updating} type='submit'>
            {creating || updating ? <LoadingSpinner size='sm' /> : 'Salvar'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default RoleFormModal;
