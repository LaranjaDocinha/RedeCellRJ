import React, { Children, isValidElement, cloneElement } from 'react';
import { StyledToggleButtonGroup } from './ToggleButtonGroup.styled';
import ToggleButton from './ToggleButton'; // Importar o ToggleButton

interface ToggleButtonGroupProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  exclusive?: boolean; // Se true, apenas um botão pode ser selecionado
  children: React.ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
  value,
  onChange,
  exclusive = false,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}) => {
  const handleButtonClick = (buttonValue: string) => {
    if (exclusive) {
      // Seleção exclusiva
      onChange(value === buttonValue ? '' : buttonValue);
    } else {
      // Seleção múltipla
      const currentValue = Array.isArray(value) ? value : [];
      if (currentValue.includes(buttonValue)) {
        onChange(currentValue.filter((val) => val !== buttonValue));
      } else {
        onChange([...currentValue, buttonValue]);
      }
    }
  };

  return (
    <StyledToggleButtonGroup role="group" aria-label={ariaLabel} aria-labelledby={ariaLabelledby}>
      {Children.map(children, (child) => {
        if (!isValidElement(child) || child.type !== ToggleButton) {
          return child;
        }

        const isSelected = exclusive
          ? value === child.props.value
          : Array.isArray(value) && value.includes(child.props.value);

        return cloneElement(child, {
          selected: isSelected,
          onChange: handleButtonClick,
        });
      })}
    </StyledToggleButtonGroup>
  );
};

export default ToggleButtonGroup;
