import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardTitle } from 'reactstrap';

import AdvancedTable from '../../../../components/Common/AdvancedTable';

const SalesDetailTable = ({ data, loading, error }) => {
  const columns = useMemo(
    () => [
      {
        header: 'ID da Venda',
        accessorKey: 'sale_id',
      },
      {
        header: 'Data',
        accessorKey: 'sale_date',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      },
      {
        header: 'Cliente',
        accessorKey: 'customer_name',
        cell: (info) => info.getValue() || 'N/A',
      },
      {
        header: 'Total (R$)',
        accessorKey: 'total_amount',
        cell: (info) => parseFloat(info.getValue()).toFixed(2),
      },
      {
        header: 'Itens Vendidos',
        accessorKey: 'total_items',
      },
      {
        header: 'Método de Pagamento',
        accessorKey: 'payment_method',
      },
    ],
    [],
  );

  return (
    <Card>
      <CardBody>
        <CardTitle className='h5 mb-4'>Detalhes das Vendas</CardTitle>
        <AdvancedTable
          columns={columns}
          data={data || []}
          emptyStateIcon={''}
          emptyStateMessage={'Não há detalhes de venda para exibir.'}
          emptyStateTitle={'Nenhum detalhe de venda encontrado'}
          loading={loading}
          persistenceKey='salesDetailTable'
        />
      </CardBody>
    </Card>
  );
};

SalesDetailTable.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.object,
};

export default SalesDetailTable;
