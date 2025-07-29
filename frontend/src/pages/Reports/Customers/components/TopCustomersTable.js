import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardTitle } from 'reactstrap';

import AdvancedTable from '../../../../components/Common/AdvancedTable';

const TopCustomersTable = ({ data, loading, error }) => {
  const columns = useMemo(
    () => [
      {
        header: 'Cliente',
        accessorKey: 'name',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Telefone',
        accessorKey: 'phone',
      },
      {
        header: 'Total Gasto (R$)',
        accessorKey: 'total_spent',
        cell: (info) => parseFloat(info.getValue()).toFixed(2),
      },
      {
        header: 'Total de Compras',
        accessorKey: 'total_purchases',
      },
      {
        header: 'Última Compra',
        accessorKey: 'last_purchase_date',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      },
    ],
    [],
  );

  return (
    <Card>
      <CardBody>
        <CardTitle className='h5 mb-4'>Top Clientes</CardTitle>
        <AdvancedTable
          columns={columns}
          data={data || []}
          emptyStateIcon={''}
          emptyStateMessage={'Não há dados de clientes para exibir.'}
          emptyStateTitle={'Nenhum cliente encontrado'}
          loading={loading}
          persistenceKey='topCustomersTable'
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
