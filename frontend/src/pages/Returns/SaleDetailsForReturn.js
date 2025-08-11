import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardTitle, Table, Button, Input, Alert } from 'reactstrap';

const SaleDetailsForReturn = ({ sale, onProcessReturn, loading }) => {
  const [itemsToReturn, setItemsToReturn] = useState([]);

  useEffect(() => {
    // Inicializa o estado com os itens da venda, com quantidade 0 para devolução
    if (sale && sale.items) {
      setItemsToReturn(sale.items.map((item) => ({ ...item, returnQuantity: 0 })));
    }
  }, [sale]);

  const handleQuantityChange = (index, value) => {
    const newItems = [...itemsToReturn];
    const maxQuantity = newItems[index].quantity;
    const newQuantity = Math.max(0, Math.min(Number(value), maxQuantity));
    newItems[index].returnQuantity = newQuantity;
    setItemsToReturn(newItems);
  };

  const handleSubmit = () => {
    const itemsPayload = itemsToReturn
      .filter((item) => item.returnQuantity > 0)
      .map((item) => ({
        variationId: item.variation_id, // Precisamos do variation_id
        quantity: item.returnQuantity,
        unitPrice: item.unit_price,
      }));
    onProcessReturn(itemsPayload);
  };

  if (!sale) return null;

  return (
    <Card className='mt-4'>
      <CardBody>
        <CardTitle className='h5'>Detalhes da Venda #{sale.id}</CardTitle>
        <p>
          <strong>Cliente:</strong> {sale.customer_name || 'Não informado'}
        </p>
        <p>
          <strong>Data:</strong> {new Date(sale.sale_date).toLocaleString('pt-BR')}
        </p>

        <h6 className='mt-4'>Itens para Devolução</h6>
        <Alert color='info'>Selecione a quantidade de cada item a ser devolvido.</Alert>
        <Table bordered responsive>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Qtde. Vendida</th>
              <th>Preço Unit.</th>
              <th style={{ width: '150px' }}>Qtde. a Devolver</th>
            </tr>
          </thead>
          <tbody>
            {itemsToReturn.map((item, index) => (
              <tr key={item.item_id}>
                <td>
                  {item.product_name} ({item.color || 'Padrão'})
                </td>
                <td>{item.quantity}</td>
                <td>R$ {parseFloat(item.unit_price).toFixed(2)}</td>
                <td>
                  <Input
                    max={item.quantity}
                    min='0'
                    type='number'
                    value={item.returnQuantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className='d-flex justify-content-end mt-3'>
          <Button color='primary' disabled={loading} onClick={handleSubmit}>
            {loading ? 'Processando...' : 'Confirmar Devolução'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default SaleDetailsForReturn;
