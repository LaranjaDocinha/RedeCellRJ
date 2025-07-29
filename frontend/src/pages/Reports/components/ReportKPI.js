import React from 'react';
import { Card, CardBody } from 'reactstrap';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { NumericFormat } from 'react-number-format';

const ReportKPI = ({ title, value, format = 'number', loading }) => {
  const formatValue = (val) => {
    if (val === undefined || val === null) return 'N/A';
    if (format === 'currency') {
      return (
        <NumericFormat
          fixedDecimalScale
          decimalScale={2}
          decimalSeparator={','}
          displayType={'text'}
          prefix={'R$ '}
          thousandSeparator={'.'}
          value={val}
        />
      );
    }
    return (
      <NumericFormat
        decimalSeparator={','}
        displayType={'text'}
        thousandSeparator={'.'}
        value={val}
      />
    );
  };

  return (
    <Card className='kpi-card'>
      <CardBody>
        {loading ? <Skeleton height={30} /> : <h4 className='kpi-value'>{formatValue(value)}</h4>}
        <p className='text-muted mb-0 kpi-title'>{title}</p>
      </CardBody>
    </Card>
  );
};

export default ReportKPI;
