import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardTitle } from 'reactstrap';
import AdvancedTable from '../../../../components/Common/AdvancedTable';

const TopCustomersTable = ({ data, loading, error }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Cliente',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Telefone',
        accessor: 'phone',
      },
      {
        Header: 'Total Gasto (R$)',
        accessor: 'total_spent',
        Cell: ({ value }) => parseFloat(value).toFixed(2),
      },
      {
        Header: 'Total de Compras',
        accessor: 'total_purchases',
      },
      {
        Header: 'Última Compra',
        accessor: 'last_purchase_date',
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
    ],
    []
  );

  return (
    <Card>
      <CardBody>
        <CardTitle className="h5 mb-4">Top Clientes</CardTitle>
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

TopCustomersTable.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.object,
};

export default TopCustomersTable;
