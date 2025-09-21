import React from 'react';
import { useFormContext, get } from 'react-hook-form';
import Input from './Input';
import { FormFieldContainer, FieldLabel, ErrorMessageText } from './Field.styled';

interface FieldProps {
  name: string;
  label: string;
  type?: string;
}

const Field: React.FC<FieldProps> = ({ name, label, type = 'text', ...rest }) => {
  const { register, formState: { errors } } = useFormContext();
  const error = get(errors, name);

  return (
    <FormFieldContainer>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input id={name} type={type} {...register(name)} {...rest} />
      {error && <ErrorMessageText>{error.message}</ErrorMessageText>}
    </FormFieldContainer>
  );
};

export default Field;
