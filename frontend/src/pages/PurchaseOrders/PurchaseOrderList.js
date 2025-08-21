import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Badge } from 'reactstrap';
import toast from 'react-hot-toast';

import useApi from '../../hooks/useApi';
import { get } from '../../helpers/api_helper';
import AdvancedTable from '../../components/Common/AdvancedTable';

const PurchaseOrderList = () => {
  const navigate = useNavigate();
  const { data, loading, request: fetchPurchaseOrders } = useApi('get');

  const purchaseOrders = data?.purchaseOrders || [];

  const fetchOrders = useCallback(() => {
    fetchPurchaseOrders('/api/purchase-orders');
  }, [fetchPurchaseOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateClick = () => {
    navigate('/purchase-orders/new');
  };

  const handleRowClick = (row) => {
    navigate(`/purchase-orders/${row.original.id}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pendente':
        return <Badge color='warning'>Pendente</Badge>;
      case 'Recebido Parcialmente':
        return <Badge color='info'>Recebido Parcialmente</Badge>;
      case 'Recebido':
        return <Badge color='success'>Recebido</Badge>;
      case 'Cancelado':
        return <Badge color='danger'>Cancelado</Badge>;
      default:
        return <Badge color='secondary'>{status}</Badge>;
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: '#' },
      { accessorKey: 'supplier_name', header: 'Fornecedor' },
      {
        accessorKey: 'order_date',
        header: 'Data do Pedido',
        cell: ({ value }) => new Date(value).toLocaleDateString('pt-BR'),
      },
      {
        accessorKey: 'total_amount',
        header: 'Valor Total',
        cell: ({ value }) => `R$ ${parseFloat(value).toFixed(2)}`,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ value }) => getStatusBadge(value),
      },
    ],
    [],
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Row>
            <Col lg='12'>
              <Card>
                <CardBody>
                  <div className='d-flex justify-content-between align-items-center mb-4'>
                    <CardTitle className='h4 mb-0'>Ordens de Compra</CardTitle>
                    <Button color='primary' onClick={handleCreateClick}>
                      Criar Nova Ordem
                    </Button>
                  </div>

                  <AdvancedTable
                    columns={columns}
                    data={purchaseOrders}
                    emptyStateActionText={'Adicionar Pedido de Compra'}
                    emptyStateIcon={''}
                    emptyStateMessage={'Cadastre seu primeiro pedido de compra.'}
                    emptyStateTitle={'Nenhum pedido de compra encontrado'}
                    loading={loading}
                    persistenceKey='purchaseOrdersTable'
                    onEmptyStateActionClick={handleCreateClick}
                    onRowClick={handleRowClick}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PurchaseOrderList;
