import React from 'react';

export interface ImeiInputProps {
  label: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export const ImeiInput: React.FC<ImeiInputProps> = ({ label, defaultValue, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '').slice(0, 15);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div>
      <label>{label}</label>
      <input 
        type="text" 
        defaultValue={defaultValue}
        onChange={handleChange}
        maxLength={15}
        placeholder="Digite os 15 dígitos do IMEI"
      />
    </div>
  );
};
