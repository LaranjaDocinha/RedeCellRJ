import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import useDashboardKpis from '../../hooks/useDashboardKpis';

import WidgetContainer from './WidgetContainer';
import KpiCard from './KpiCard';
import WidgetEmptyState from './WidgetEmptyState';

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
  height: 100%;
`;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

const KpiWidget = () => {
  const { data, isLoading, error } = useDashboardKpis();

  if (error) {
    return (
      <WidgetContainer>
        <WidgetEmptyState message='Erro ao carregar dados.' />
      </WidgetContainer>
    );
  }

  const kpis = [
    {
      title: 'Vendas Totais',
      prefix: 'R$ ',
      value: data?.totalSales.value,
      trend: data?.totalSales.trend,
      percentage: data?.totalSales.percentage,
    },
    {
      title: 'Ticket Médio',
      prefix: 'R$ ',
      value: data?.avgTicket.value,
      trend: data?.avgTicket.trend,
      percentage: data?.avgTicket.percentage,
    },
    {
      title: 'Novos Clientes',
      value: data?.newCustomers.value,
      trend: data?.newCustomers.trend,
      percentage: data?.newCustomers.percentage,
    },
    {
      title: 'Pedidos',
      value: data?.totalOrders.value,
      trend: data?.totalOrders.trend,
      percentage: data?.totalOrders.percentage,
    },
  ];

  return (
    <WidgetContainer>
      <KpiGrid>
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            animate='visible'
            custom={index}
            initial='hidden'
            variants={cardVariants}
          >
            <KpiCard isLoading={isLoading} {...kpi} />
          </motion.div>
        ))}
      </KpiGrid>
    </WidgetContainer>
  );
};

export default KpiWidget;
