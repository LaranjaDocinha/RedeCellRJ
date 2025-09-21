import React from 'react';

interface PaymentMethodSelectorProps {
  onSelect: (method: string) => void;
  selectedMethod: string;
  availableMethods: string[];
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ onSelect, selectedMethod, availableMethods }) => {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700">Select Payment Method</label>
      <select
        id="payment-method"
        value={selectedMethod}
        onChange={(e) => onSelect(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="">-- Select --</option>
        {availableMethods.map((method) => (
          <option key={method} value={method}>
            {method.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} {/* Format for display */}
          </option>
        ))}
      </select>
    </div>
  );
};
