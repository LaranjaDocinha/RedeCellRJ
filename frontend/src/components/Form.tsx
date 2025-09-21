import React from 'react';
import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { StyledForm } from './Form.styled';

interface FormProps<TFormValues extends FieldValues> extends UseFormProps<TFormValues> {
  onSubmit: (data: TFormValues, formMethods: UseFormReturn<TFormValues>) => void;
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
  className?: string;
}

const Form = <TFormValues extends FieldValues>({ onSubmit, children, className, ...useFormProps }: FormProps<TFormValues>) => {
  const methods = useForm<TFormValues>(useFormProps);
  return (
    <StyledForm onSubmit={methods.handleSubmit((data) => onSubmit(data, methods))} className={className}>
      {children(methods)}
    </StyledForm>
  );
};

export default Form;
