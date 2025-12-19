import React, { useState, useEffect } from 'react';
import {
  StyledForm,
  StyledFormField,
  StyledLabel,
  StyledInput,
  StyledTextArea,
  StyledButtonContainer,
} from './CustomerForm.styled';
import { Button } from '../components/Button';

interface CustomerFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  cpf?: string;
  birth_date?: string;
  referral_code?: string;
}

interface CustomerFormProps {
  initialData?: CustomerFormData & { id?: number };
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    cpf: '',
    birth_date: '',
    referral_code: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <StyledForm
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <StyledFormField>
        <StyledLabel htmlFor="name">Name</StyledLabel>
        <StyledInput
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="email">Email</StyledLabel>
        <StyledInput
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="phone">Phone</StyledLabel>
        <StyledInput
          type="text"
          name="phone"
          id="phone"
          value={formData.phone || ''}
          onChange={handleChange}
        />
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="address">Address</StyledLabel>
        <StyledTextArea
          name="address"
          id="address"
          value={formData.address || ''}
          onChange={handleChange}
          rows={3}
        ></StyledTextArea>
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="cpf">CPF</StyledLabel>
        <StyledInput
          type="text"
          name="cpf"
          id="cpf"
          value={formData.cpf || ''}
          onChange={handleChange}
        />
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="birth_date">Birth Date</StyledLabel>
        <StyledInput
          type="date"
          name="birth_date"
          id="birth_date"
          value={formData.birth_date || ''}
          onChange={handleChange}
        />
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="referral_code">Código de Indicação</StyledLabel>
        <StyledInput
          type="text"
          name="referral_code"
          id="referral_code"
          value={formData.referral_code || ''}
          onChange={handleChange}
        />
      </StyledFormField>
      <StyledButtonContainer>
        <Button
          type="button"
          onClick={onCancel}
          variant="outlined"
          color="secondary"
          label="Cancel"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          label={initialData ? 'Update Customer' : 'Add Customer'}
        />
      </StyledButtonContainer>
    </StyledForm>
  );
};