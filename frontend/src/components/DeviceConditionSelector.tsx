import React from 'react';

export interface DeviceConditionSelectorProps {
  onChange?: (value: string) => void;
}

const conditions = ['Novo', 'Seminovo', 'Vitrine', 'Recondicionado'];

export const DeviceConditionSelector: React.FC<DeviceConditionSelectorProps> = ({ onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <div>
      <label>Condição do Aparelho</label>
      <select onChange={handleChange}>
        {conditions.map(condition => (
          <option key={condition} value={condition}>{condition}</option>
        ))}
      </select>
    </div>
  );
};
