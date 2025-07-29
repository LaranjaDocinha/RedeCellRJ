import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardTitle } from 'reactstrap';

import AdvancedTable from '../../../../components/Common/AdvancedTable';

const ProfitabilityTable = ({ data, loading, error }) => {
  const columns = useMemo(
    () => [
      {
        header: 'Produto',
        accessorKey: 'name',
      },
      {
        header: 'Unidades Vendidas',
        accessorKey: 'units_sold',
      },
      {
        header: 'Receita Total (R$)',
        accessorKey: 'total_revenue',
        cell: (info) => parseFloat(info.getValue()).toFixed(2),
      },
      {
        header: 'Custo Total (R$)',
        accessorKey: 'total_cost',
        cell: (info) => parseFloat(info.getValue()).toFixed(2),
      },
      {
        header: 'Lucro Total (R$)',
        accessorKey: 'total_profit',
        cell: (info) => parseFloat(info.getValue()).toFixed(2),
      },
      {
        header: 'Margem (%)',
        accessorKey: 'profit_margin',
        cell: (info) => `${parseFloat(info.getValue()).toFixed(2)}%`,
      },
    ],
    [],
  );

  return (
    <Card>
      <CardBody>
        <CardTitle className='h5 mb-4'>Lucratividade por Produto</CardTitle>
        <AdvancedTable
          columns={columns}
          data={data || []}
          emptyStateIcon={''}
          emptyStateMessage={'Não há dados de lucratividade para exibir.'}
          emptyStateTitle={'Nenhum dado de lucratividade encontrado'}
          loading={loading}
          persistenceKey='profitabilityTable'
        />
      </CardBody>
    </Card>
  );
};

ProfitabilityTable.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.object,
};

export default ProfitabilityTable;
