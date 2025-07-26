import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardTitle } from 'reactstrap';
import AdvancedTable from '../../../../components/Common/AdvancedTable';

const SalesDetailTable = ({ data, loading, error }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'ID da Venda',
        accessor: 'sale_id',
      },
      {
        Header: 'Data',
        accessor: 'sale_date',
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Cliente',
        accessor: 'customer_name',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'Total (R$)',
        accessor: 'total_amount',
        Cell: ({ value }) => parseFloat(value).toFixed(2),
      },
      {
        Header: 'Itens Vendidos',
        accessor: 'total_items',
      },
      {
        Header: 'Método de Pagamento',
        accessor: 'payment_method',
      },
    ],
    []
  );

  return (
    <Card>
      <CardBody>
        <CardTitle className="h5 mb-4">Detalhes das Vendas</CardTitle>
        <AdvancedTable
          columns={columns}
          data={data || []}
          loading={loading}
          error={error}
          usePagination
          useSortBy
          useGlobalFilter
          emptyStateIcon="bx bx-cart-alt"
          emptyStateTitle="Nenhuma venda encontrada"
          emptyStateMessage="Não há registros de vendas para o período selecionado."
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
