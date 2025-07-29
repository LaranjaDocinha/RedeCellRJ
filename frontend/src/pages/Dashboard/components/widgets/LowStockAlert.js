import React from 'react';
import './LowStockAlert.scss';

const lowStockData = [
  { id: 1, name: 'Película de Vidro iPhone 13', current: 3, min: 5, sku: 'PV-IP13' },
  { id: 2, name: 'Cabo USB-C 2m', current: 8, min: 10, sku: 'CB-USBC-2M' },
  { id: 3, name: 'Carregador Turbo 30W', current: 4, min: 5, sku: 'CRG-TRB-30' },
  { id: 4, name: 'Capinha Silicone Galaxy S22', current: 1, min: 3, sku: 'CAP-SIL-S22' },
  { id: 5, name: 'Fone Bluetooth TWS', current: 9, min: 10, sku: 'FBT-TWS-01' },
];

const StockLevel = ({ current, min }) => {
  const percentage = (current / min) * 100;
  let colorClass = '';

  if (percentage <= 50) {
    colorClass = 'danger';
  } else if (percentage <= 80) {
    colorClass = 'warning';
  }

  return (
    <span className={`stock-value ${colorClass}`}>
      {current}/{min}
    </span>
  );
};

const LowStockAlert = () => {
  return (
    <div className='low-stock-container'>
      <ul className='low-stock-list'>
        {lowStockData.map((item) => (
          <li key={item.id} className='low-stock-item'>
            <div className='item-info'>
              <span className='item-name'>{item.name}</span>
              <span className='item-sku'>{item.sku}</span>
            </div>
            <div className='item-stock'>
              <span className='stock-label'>Estoque:</span>
              <StockLevel current={item.current} min={item.min} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockAlert;
