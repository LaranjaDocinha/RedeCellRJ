import React from 'react';
import styled from 'styled-components';
import { ArrowUp, ArrowDown } from 'react-feather';
import CountUp from 'react-countup';
import WidgetSkeleton from './WidgetSkeleton';

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const Title = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  font-weight: 500;

  body.dark-mode & {
    color: #aaa;
  }
`;

const Value = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin: 8px 0;
  color: inherit;
`;

const Trend = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $trend }) => ($trend === 'up' ? '#28a745' : '#dc3545')};

  svg {
    margin-right: 4px;
  }
`;

const KpiCard = ({ title, value, prefix = '', suffix = '', trend, percentage, isLoading }) => {
  if (isLoading) {
    return (
      <div>
        <WidgetSkeleton height={20} width="80%" />
        <WidgetSkeleton height={38} width="60%" style={{ margin: '8px 0' }} />
        <WidgetSkeleton height={18} width="40%" />
      </div>
    );
  }

  // Extrai apenas os números do valor para o CountUp
  const numericValue = parseFloat(String(value).replace(/[^0-9.,]/g, '').replace(',', '.'));

  return (
    <CardWrapper>
      <div>
        <Title>{title}</Title>
        <Value>
          <CountUp
            start={0}
            end={numericValue || 0}
            duration={1.5}
            separator="."
            decimal=","
            decimals={2}
            prefix={prefix}
            suffix={suffix}
          />
        </Value>
      </div>
      {trend && (
        <Trend $trend={trend}>
          {trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          <span>{percentage}% vs. ontem</span>
        </Trend>
      )}
    </CardWrapper>
  );
};

export default KpiCard;
