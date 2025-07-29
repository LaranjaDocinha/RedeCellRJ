import React from 'react';
import { Button, ButtonGroup } from 'reactstrap';

import { useGlobalFilter } from '../../context/GlobalFilterContext';

const GlobalPeriodFilter = () => {
  const { globalPeriod, setGlobalPeriod } = useGlobalFilter();

  const periods = [
    { key: 'today', label: 'Hoje' },
    { key: 'last7days', label: '7 Dias' },
    { key: 'thisMonth', label: 'Este Mês' },
    { key: 'last30days', label: '30 Dias' },
    { key: 'thisYear', label: 'Este Ano' },
  ];

  return (
    <ButtonGroup className='d-none d-md-block'>
      {periods.map((period) => (
        <Button
          key={period.key}
          color='primary'
          outline={globalPeriod !== period.key}
          size='sm'
          onClick={() => setGlobalPeriod(period.key)}
        >
          {period.label}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default GlobalPeriodFilter;
