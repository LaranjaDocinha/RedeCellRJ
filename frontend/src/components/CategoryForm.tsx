import React, { useState, useEffect } from 'react';
import {
  StyledForm,
  StyledFormField,
  StyledLabel,
  StyledInput,
  StyledTextArea,
  StyledButtonContainer,
} from './CategoryForm.styled';
import { Button } from '../components/Button';

interface CategoryFormData {
  name: string;
  description?: string;
}

interface CategoryFormProps {
  initialData?: CategoryFormData & { id?: number };
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
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
        <StyledLabel htmlFor="description">Description</StyledLabel>
        <StyledTextArea
          name="description"
          id="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
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
          label={initialData ? 'Update Category' : 'Add Category'}
        />
      </StyledButtonContainer>
    </StyledForm>
  );
};
