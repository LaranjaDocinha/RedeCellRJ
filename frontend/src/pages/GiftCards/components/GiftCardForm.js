import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, Label, Input, Spinner, Alert } from 'reactstrap';
import useApi from '../../../hooks/useApi'; // Adjust path as needed
import toast from 'react-hot-toast';

const GiftCardForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    initial_value: '',
    expiry_date: '',
    customer_id: '',
  });

  const { request: createGiftCard, isLoading, error } = useApi('post');

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
      await createGiftCard('/api/gift-cards', formData);
      toast.success('Vale-presente emitido com sucesso!');
      onSuccess(); // Call onSuccess to close modal and refresh list
    } catch (err) {
      toast.error(err.message || 'Erro ao emitir vale-presente.');
    }
  };

  return (
    <div className="gift-card-form p-4">
      <h2>Emitir Vale-Presente</h2>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="initial_value">Valor Inicial:</Label>
          <Input
            type="number"
            id="initial_value"
            name="initial_value"
            value={formData.initial_value}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
          />
        </FormGroup>
        <FormGroup>
          <Label for="expiry_date">Data de Expiração:</Label>
          <Input
            type="date"
            id="expiry_date"
            name="expiry_date"
            value={formData.expiry_date}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="customer_id">ID do Cliente (Opcional):</Label>
          <Input
            type="number"
            id="customer_id"
            name="customer_id"
            value={formData.customer_id} // Corrected from formData.customer.id
            onChange={handleChange}
            placeholder="ID do cliente"
          />
        </FormGroup>

        {error && <Alert color="danger" className="mt-3">{error.message}</Alert>}

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button type="button" color="secondary" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" color="primary" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : 'Emitir'}
          </Button>
        </div>
      </form>
    </div>
  );
};

GiftCardForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default GiftCardForm;
