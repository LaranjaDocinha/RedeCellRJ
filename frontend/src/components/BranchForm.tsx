import React, { useState, useEffect } from 'react';
import {
  StyledForm,
  StyledFormField,
  StyledLabel,
  StyledInput,
  StyledTextArea,
  StyledButtonContainer,
} from './BranchForm.styled';
import { Button } from '../components/Button';

interface BranchFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface BranchFormProps {
  initialData?: BranchFormData & { id?: number };
  onSubmit: (data: BranchFormData) => void;
  onCancel: () => void;
}

export const BranchForm: React.FC<BranchFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
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
        <StyledLabel htmlFor="email">Email</StyledLabel>
        <StyledInput
          type="email"
          name="email"
          id="email"
          value={formData.email || ''}
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
          label={initialData ? 'Update Branch' : 'Add Branch'}
        />
      </StyledButtonContainer>
    </StyledForm>
  );
};
