import React, { useState, useEffect } from 'react';
import {
  StyledForm,
  StyledFormField,
  StyledLabel,
  StyledInput,
  StyledButtonContainer,
} from './PermissionForm.styled';
import { Button } from '../components/Button';

interface PermissionFormData {
  name: string;
}

interface PermissionFormProps {
  initialData?: PermissionFormData & { id?: number };
  onSubmit: (data: PermissionFormData) => void;
  onCancel: () => void;
}

export const PermissionForm: React.FC<PermissionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<PermissionFormData>({
    name: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          label={initialData ? 'Update Permission' : 'Add Permission'}
        />
      </StyledButtonContainer>
    </StyledForm>
  );
};
