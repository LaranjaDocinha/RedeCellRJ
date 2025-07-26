import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardTitle } from 'reactstrap';
import AdvancedTable from '../../../../components/Common/AdvancedTable';

const ProfitabilityTable = ({ data, loading, error }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Produto',
        accessor: 'name',
      },
      {
        Header: 'Unidades Vendidas',
        accessor: 'units_sold',
      },
      {
        Header: 'Receita Total (R$)',
        accessor: 'total_revenue',
        Cell: ({ value }) => parseFloat(value).toFixed(2),
      },
      {
        Header: 'Custo Total (R$)',
        accessor: 'total_cost',
        Cell: ({ value }) => parseFloat(value).toFixed(2),
      },
      {
        Header: 'Lucro Total (R$)',
        accessor: 'total_profit',
        Cell: ({ value }) => parseFloat(value).toFixed(2),
      },
      {
        Header: 'Margem (%)',
        accessor: 'profit_margin',
        Cell: ({ value }) => `${parseFloat(value).toFixed(2)}%`,
      },
    ],
    []
  );

  return (
    <Card>
      <CardBody>
        <CardTitle className="h5 mb-4">Lucratividade por Produto</CardTitle>
        <AdvancedTable
          columns={columns}
          data={data || []}
          isLoading={loading}
          error={error}
          usePagination
          useSortBy
          useGlobalFilter
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
