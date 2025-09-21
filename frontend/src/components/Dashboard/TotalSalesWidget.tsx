
import React from 'react';
import DashboardWidget from './DashboardWidget';

interface TotalSalesWidgetProps {
  totalSales: number;
}

const TotalSalesWidget: React.FC<TotalSalesWidgetProps> = ({ totalSales }) => {
  return (
    <DashboardWidget title="Total Sales">
      <p className="summary-value">${totalSales.toFixed(2)}</p>
    </DashboardWidget>
  );
};

export default TotalSalesWidget;
