import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from 'reactstrap';
import axios from 'axios';

import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import config from '../../../config';

const CustomerFormModal = ({ isOpen, toggle, onSubmitSuccess }) => {
  const API_URL = config.api.API_URL;
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/customers`, formData);
      onSubmitSuccess(response.data); // Pass the new customer data to parent
      setFormData({ name: '', phone: '', email: '', address: '' }); // Reset form
      toggle(); // Close modal
    } catch (err) {
      console.error('Erro ao cadastrar cliente:', err);
      setError(err.response?.data?.msg || 'Falha ao cadastrar cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal centered isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Cadastrar Novo Cliente</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          {error && <Alert color='danger'>{error}</Alert>}
          <FormGroup>
            <Label for='name'>
              Nome <span className='text-danger'>*</span>
            </Label>
            <Input
              required
              id='name'
              name='name'
              type='text'
              value={formData.name}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='phone'>Telefone</Label>
            <Input
              id='phone'
              name='phone'
              type='text'
              value={formData.phone}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='email'>Email</Label>
            <Input
              id='email'
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='address'>Endereço</Label>
            <Input
              id='address'
              name='address'
              type='textarea'
              value={formData.address}
              onChange={handleChange}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' disabled={loading} type='submit'>
            {loading ? (
              <>
                <LoadingSpinner size='sm' /> Salvando...
              </>
            ) : (
              'Salvar Cliente'
            )}
          </Button>{' '}
          <Button color='secondary' disabled={loading} onClick={toggle}>
            Cancelar
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default CustomerFormModal;
