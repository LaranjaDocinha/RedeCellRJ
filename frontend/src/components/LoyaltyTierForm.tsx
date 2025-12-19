import React, { useState, useEffect } from 'react';
import {
  StyledForm,
  StyledFormField,
  StyledLabel,
  StyledInput,
  StyledTextArea,
  StyledButtonContainer,
} from './LoyaltyTierForm.styled';
import { Button } from '../components/Button';

interface LoyaltyTierFormData {
  name: string;
  min_points: number;
  description?: string;
  benefits?: string; // Storing as string for JSON input
}

interface LoyaltyTierFormProps {
  initialData?: LoyaltyTierFormData & { id?: number };
  onSubmit: (data: LoyaltyTierFormData) => void;
  onCancel: () => void;
}

export const LoyaltyTierForm: React.FC<LoyaltyTierFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<LoyaltyTierFormData>({
    name: '',
    min_points: 0,
    description: '',
    benefits: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        benefits: initialData.benefits ? JSON.stringify(initialData.benefits, null, 2) : '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'min_points' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData };
      if (dataToSubmit.benefits) {
        dataToSubmit.benefits = JSON.parse(dataToSubmit.benefits); // Parse benefits string to JSON object
      }
      onSubmit(dataToSubmit);
    } catch (error) {
      alert('Invalid JSON in Benefits field.');
      console.error('Invalid JSON in Benefits:', error);
    }
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
        <StyledLabel htmlFor="min_points">Minimum Points</StyledLabel>
        <StyledInput
          type="number"
          name="min_points"
          id="min_points"
          value={formData.min_points}
          onChange={handleChange}
          required
        />
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="description">Description</StyledLabel>
        <StyledTextArea
          name="description"
          id="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
        ></StyledTextArea>
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="benefits">Benefits (JSON)</StyledLabel>
        <StyledTextArea
          name="benefits"
          id="benefits"
          value={formData.benefits || ''}
          onChange={handleChange}
          rows={5}
          placeholder='e.g., { "discount": "5%", "free_shipping": true }'
        ></StyledTextArea>
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
          label={initialData ? 'Update Tier' : 'Add Tier'}
        />
      </StyledButtonContainer>
    </StyledForm>
  );
};
