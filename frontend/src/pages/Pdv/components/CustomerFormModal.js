import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Button, Spinner, Alert } from "reactstrap";
import axios from "axios";
import config from "../../../config";

const CustomerFormModal = ({ isOpen, toggle, onSubmitSuccess }) => {
  const API_URL = config.api.API_URL;
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      console.error("Erro ao cadastrar cliente:", err);
      setError(err.response?.data?.msg || "Falha ao cadastrar cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Cadastrar Novo Cliente</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}
          <FormGroup>
            <Label for="name">Nome <span className="text-danger">*</span></Label>
            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label for="phone">Telefone</Label>
            <Input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label for="address">Endereço</Label>
            <Input type="textarea" name="address" id="address" value={formData.address} onChange={handleChange} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit" disabled={loading}>
            {loading ? <><Spinner size="sm" /> Salvando...</> : 'Salvar Cliente'}
          </Button>{' '}
          <Button color="secondary" onClick={toggle} disabled={loading}>Cancelar</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default CustomerFormModal;