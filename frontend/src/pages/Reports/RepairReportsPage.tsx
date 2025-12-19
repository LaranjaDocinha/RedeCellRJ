import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';

const RepairReportsPage: React.FC = () => {
  const [profitability, setProfitability] = useState<any[]>([]);

  useEffect(() => {
    // fetch('/api/extended-reports/repair-profitability').then...
    // Mock data:
    setProfitability([
      { id: 1, budget_value: 500, total_cost: 300 },
      { id: 2, budget_value: 250, total_cost: 150 },
    ]);
  }, []);

  const chartOptions = {
    chart: { id: 'profitability-chart' },
    xaxis: { categories: profitability.map(p => `OS #${p.id}`) },
  };

  const chartSeries = [
    { name: 'Orçamento', data: profitability.map(p => p.budget_value) },
    { name: 'Custo', data: profitability.map(p => p.total_cost) },
  ];

  return (
    <div>
      <h2>Relatório de Lucratividade de Reparos</h2>
      <Chart options={chartOptions} series={chartSeries} type="bar" height={350} />
    </div>
  );
};

export default RepairReportsPage;
