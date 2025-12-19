import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../components/Button';
import Input from '../components/Input'; // Para o campo de notas

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const ChecklistItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f8f9fa;
  padding: 10px 15px;
  border-radius: 5px;
  border: 1px solid #eee;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  min-width: 20px;
  min-height: 20px;
  cursor: pointer;
`;

const ItemLabel = styled.label`
  flex-grow: 1;
  color: #333;
  font-size: 1em;
  font-weight: 500;
`;

const Title = styled.h3`
  margin-bottom: 15px;
  color: #333;
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 0.9em;
  text-align: center;
`;

const SuccessMessage = styled.p`
  color: #28a745;
  font-size: 0.9em;
  text-align: center;
`;

interface ChecklistItem {
  item_name: string;
  checked: boolean;
  notes?: string;
}

interface ChecklistFormComponentProps {
  serviceOrderId: number;
  checklistTemplate: {
    id: number;
    name: string;
    items: { item_name: string }[];
  };
  onSubmit: (checklistData: any) => void;
  isLoading?: boolean;
  error?: string;
  isSubmitted?: boolean;
}

const ChecklistFormComponent: React.FC<ChecklistFormComponentProps> = ({
  serviceOrderId,
  checklistTemplate,
  onSubmit,
  isLoading = false,
  error,
  isSubmitted = false,
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (checklistTemplate && checklistTemplate.items) {
      setChecklist(
        checklistTemplate.items.map((item) => ({
          item_name: item.item_name,
          checked: false,
          notes: '',
        })),
      );
    }
  }, [checklistTemplate]);

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newChecklist = [...checklist];
    newChecklist[index].checked = checked;
    setChecklist(newChecklist);
  };

  const handleNotesChange = (index: number, notes: string) => {
    const newChecklist = [...checklist];
    newChecklist[index].notes = notes;
    setChecklist(newChecklist);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ templateId: checklistTemplate.id, items: checklist });
  };

  if (isSubmitted) {
    return <SuccessMessage>Checklist enviado com sucesso!</SuccessMessage>;
  }

  return (
    <FormContainer onSubmit={handleSubmit}>
      <Title>Checklist: {checklistTemplate.name}</Title>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {checklist.map((item, index) => (
        <ChecklistItemContainer key={index}>
          <Checkbox
            id={`checklist-item-${serviceOrderId}-${index}`}
            checked={item.checked}
            onChange={(e) => handleCheckboxChange(index, e.target.checked)}
            disabled={isLoading}
          />
          <ItemLabel htmlFor={`checklist-item-${serviceOrderId}-${index}`}>
            {item.item_name}
          </ItemLabel>
          {item.checked && (
            <Input
              placeholder="Notas (Opcional)"
              value={item.notes}
              onChange={(e) => handleNotesChange(index, e.target.value)}
              disabled={isLoading}
              small // Prop para um input menor, se suportado pelo Input componente
            />
          )}
        </ChecklistItemContainer>
      ))}

      <Button type="submit" disabled={isLoading || checklist.some(item => !item.checked)}>
        {isLoading ? 'Enviando...' : 'Finalizar Checklist'}
      </Button>
    </FormContainer>
  );
};

export default ChecklistFormComponent;
