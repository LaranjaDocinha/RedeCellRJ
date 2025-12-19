import React, { useState, useEffect } from 'react';
import {
  StyledForm,
  StyledFormField,
  StyledLabel,
  StyledInput,
  StyledSelect,
  StyledCheckboxContainer,
  StyledCheckbox,
  StyledButtonContainer,
} from './DiscountForm.styled';
import { Button } from '../components/Button';

interface DiscountFormData {
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  start_date: string;
  end_date?: string;
  min_purchase_amount?: number;
  max_uses?: number;
  is_active?: boolean;
}

interface DiscountFormProps {
  initialData?: DiscountFormData & { id?: number };
  onSubmit: (data: DiscountFormData) => void;
  onCancel: () => void;
}

export const DiscountForm: React.FC<DiscountFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<DiscountFormData>({
    name: '',
    type: 'percentage',
    value: 0,
    start_date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    end_date: '',
    min_purchase_amount: 0,
    max_uses: 0,
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        start_date: initialData.start_date
          ? new Date(initialData.start_date).toISOString().slice(0, 16)
          : '',
        end_date: initialData.end_date
          ? new Date(initialData.end_date).toISOString().slice(0, 16)
          : '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
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
        <StyledLabel htmlFor="type">Type</StyledLabel>
        <StyledSelect name="type" id="type" value={formData.type} onChange={handleChange} required>
          <option value="percentage">Percentage</option>
          <option value="fixed_amount">Fixed Amount</option>
        </StyledSelect>
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="value">Value</StyledLabel>
        <StyledInput
          type="number"
          name="value"
          id="value"
          value={formData.value}
          onChange={handleChange}
          required
          step="0.01"
        />
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="start_date">Start Date</StyledLabel>
        <StyledInput
          type="datetime-local"
          name="start_date"
          id="start_date"
          value={formData.start_date}
          onChange={handleChange}
          required
        />
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="end_date">End Date</StyledLabel>
        <StyledInput
          type="datetime-local"
          name="end_date"
          id="end_date"
          value={formData.end_date || ''}
          onChange={handleChange}
        />
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="min_purchase_amount">Min Purchase Amount</StyledLabel>
        <StyledInput
          type="number"
          name="min_purchase_amount"
          id="min_purchase_amount"
          value={formData.min_purchase_amount || 0}
          onChange={handleChange}
          step="0.01"
        />
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="max_uses">Max Uses</StyledLabel>
        <StyledInput
          type="number"
          name="max_uses"
          id="max_uses"
          value={formData.max_uses || 0}
          onChange={handleChange}
          step="1"
        />
      </StyledFormField>
      <StyledCheckboxContainer>
        <StyledCheckbox
          name="is_active"
          id="is_active"
          checked={formData.is_active}
          onChange={handleChange}
        />
        <StyledLabel htmlFor="is_active">Is Active</StyledLabel>
      </StyledCheckboxContainer>
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
          label={initialData ? 'Update Discount' : 'Add Discount'}
        />
      </StyledButtonContainer>
    </StyledForm>
  );
};
