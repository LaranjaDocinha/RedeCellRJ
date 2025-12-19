import React, { useState, useEffect } from 'react';
import {
  StyledForm,
  StyledFormField,
  StyledLabel,
  StyledInput,
  StyledTextArea,
  StyledSelect,
  StyledButtonContainer,
} from './KanbanCardForm.styled';
import { Button } from '../Button';

interface KanbanCardFormData {
  title: string;
  description?: string;
  due_date?: string;
  assignee_id?: number | null;
}

interface KanbanCardFormProps {
  initialData?: KanbanCardFormData & { id?: string };
  onSubmit: (data: KanbanCardFormData) => void;
  onCancel: () => void;
  availableAssignees: Array<{ id: number; name: string }>;
}

export const KanbanCardForm: React.FC<KanbanCardFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  availableAssignees,
}) => {
  const [formData, setFormData] = useState<KanbanCardFormData>({
    title: '',
    description: '',
    due_date: '',
    assignee_id: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        due_date: initialData.due_date
          ? new Date(initialData.due_date).toISOString().slice(0, 16)
          : '',
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'assignee_id' ? (value === '' ? null : parseInt(value)) : value,
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
        <StyledLabel htmlFor="title">Title</StyledLabel>
        <StyledInput
          type="text"
          name="title"
          id="title"
          value={formData.title}
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
        <StyledLabel htmlFor="due_date">Due Date</StyledLabel>
        <StyledInput
          type="datetime-local"
          name="due_date"
          id="due_date"
          value={formData.due_date || ''}
          onChange={handleChange}
        />
      </StyledFormField>
      <StyledFormField>
        <StyledLabel htmlFor="assignee_id">Assignee</StyledLabel>
        <StyledSelect
          name="assignee_id"
          id="assignee_id"
          value={formData.assignee_id || ''}
          onChange={handleChange}
        >
          <option value="">-- Select Assignee --</option>
          {availableAssignees.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.name}
            </option>
          ))}
        </StyledSelect>
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
          label={initialData ? 'Update Card' : 'Add Card'}
        />
      </StyledButtonContainer>
    </StyledForm>
  );
};
