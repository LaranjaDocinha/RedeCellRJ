import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledPaymentSelector } from '../../styles/POSStyles';

interface PaymentMethodSelectorProps {
  onSelect: (method: string) => void;
  selectedMethod: string;
  availableMethods: string[];
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelect,
  selectedMethod,
  availableMethods,
}) => {
  const { t } = useTranslation();

  return (
    <StyledPaymentSelector>
      <label htmlFor="payment-method">{t('payment_method')}</label>
      <select
        id="payment-method"
        value={selectedMethod}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="" disabled>{t('select_payment_method')}</option>
        {availableMethods.map((method) => (
          <option key={method} value={method}>
            {t(method)}
          </option>
        ))}
      </select>
    </StyledPaymentSelector>
  );
};

export default PaymentMethodSelector;
