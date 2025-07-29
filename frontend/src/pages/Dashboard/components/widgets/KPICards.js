import React from 'react';
import PropTypes from 'prop-types';
import CountUp from 'react-countup';

import { useDashboard } from '../../../../context/DashboardContext';
import './KPICards.scss';

const TrendIndicator = ({ value }) => {
  if (value === null || value === undefined) return null;
  const isPositive = value >= 0;
  return (
    <span className={`trend-indicator ${isPositive ? 'positive' : 'negative'}`}>
      <i className={`bx bx-trending-${isPositive ? 'up' : 'down'}`}></i>
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};

TrendIndicator.propTypes = {
  value: PropTypes.number,
};

const KPICard = ({ title, value, prefix = '', icon, color, change }) => (
  <div className='kpi-card'>
    <div className='kpi-card-header'>
      <div
        className='kpi-card-icon'
        style={{ backgroundColor: `rgba(${color}, 0.2)`, color: `rgb(${color})` }}
      >
        <i className={`bx ${icon}`}></i>
      </div>
    </div>
    <div className='kpi-card-body'>
      <h5 className='kpi-title'>{title}</h5>
      <div className='kpi-value-container'>
        <p className='kpi-value'>
          <CountUp
            decimal=','
            decimals={
              title.includes('Vendas') || title.includes('Reparos') || title.includes('Clientes')
                ? 0
                : 2
            }
            duration={1.5}
            end={value || 0}
            prefix={prefix}
            separator='.'
            start={0}
          />
        </p>
        <TrendIndicator value={change} />
      </div>
    </div>
  </div>
);

KPICard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number,
  prefix: PropTypes.string,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  change: PropTypes.number,
};

const KPICards = () => {
  const { dashboardData } = useDashboard();
  const kpis = dashboardData?.kpis;

  if (!kpis) return null;

  const kpiConfig = [
    {
      id: 'revenue',
      title: 'Faturamento',
      prefix: 'R$ ',
      icon: 'bx-dollar-circle',
      color: '85, 110, 230',
    },
    { id: 'profit', title: 'Lucro', prefix: 'R$ ', icon: 'bx-line-chart', color: '52, 195, 143' },
    { id: 'salesCount', title: 'Nº de Vendas', icon: 'bx-receipt', color: '241, 180, 76' },
    {
      id: 'averageTicket',
      title: 'Ticket Médio',
      prefix: 'R$ ',
      icon: 'bx-purchase-tag-alt',
      color: '244, 106, 106',
    },
    { id: 'newRepairsCount', title: 'Novos Reparos', icon: 'bx-wrench', color: '80, 165, 241' },
    {
      id: 'newCustomersCount',
      title: 'Novos Clientes',
      icon: 'bx-user-plus',
      color: '116, 120, 141',
    },
  ];

  return (
    <div className='kpi-cards-container'>
      {kpiConfig.map((config) => (
        <KPICard
          key={config.id}
          change={kpis[config.id]?.change}
          color={config.color}
          icon={config.icon}
          prefix={config.prefix}
          title={config.title}
          value={kpis[config.id]?.value}
        />
      ))}
    </div>
  );
};

export default KPICards;
