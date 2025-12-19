import React from 'react';
import { StyledSummaryValue } from './TotalSalesWidget.styled';

interface TotalSalesWidgetProps {
  totalSales: number;
}

const TotalSalesWidget: React.FC<TotalSalesWidgetProps> = React.memo(({ totalSales }) => {
  return (
    <StyledSummaryValue
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      R$ {totalSales.toFixed(2)}
    </StyledSummaryValue>
  );
});

export default TotalSalesWidget;