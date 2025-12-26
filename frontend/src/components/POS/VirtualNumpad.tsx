import React from 'react';
import styled from 'styled-components';
import { Button } from '@mui/material';
import { Backspace as BackspaceIcon } from '@mui/icons-material';

const NumpadContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-width: 250px;
  margin: 20px auto;
`;

const DigitButton = styled(Button)`
  height: 60px;
  font-size: 1.5rem !important;
  font-weight: bold !important;
  border-radius: 12px !important;
`;

interface VirtualNumpadProps {
  onDigit: (digit: string) => void;
  onClear: () => void;
  onBackspace: () => void;
}

const VirtualNumpad: React.FC<VirtualNumpadProps> = ({ onDigit, onBackspace, onClear }) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0'];

  return (
    <NumpadContainer>
      {digits.map((d) => (
        <DigitButton
          key={d}
          variant="outlined"
          onClick={() => {
            if (d === 'C') onClear();
            else onDigit(d);
          }}
          color={d === 'C' ? 'error' : 'primary'}
        >
          {d}
        </DigitButton>
      ))}
      <DigitButton variant="outlined" onClick={onBackspace}>
        <BackspaceIcon />
      </DigitButton>
    </NumpadContainer>
  );
};

export default VirtualNumpad;
