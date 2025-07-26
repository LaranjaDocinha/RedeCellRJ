import React from 'react';
import { Card, CardBody, CardTitle, Table, Input, Button, Badge } from 'reactstrap';

const SaleColumn = ({
  cart,
  returnMode,
  handleUpdateQuantity,
  handleUpdateItemDiscount,
  calculateItemTotal,
  handleRemoveItem,
  isCartDisabled,
  subtotal,
  calculateTotalDiscount,
  totalAmount,
  handleFinalizeSale,
  handleSuspendSale,
  handleClearSale,
}) => {

  return (
    <Card className="h-100 d-flex flex-column">
      <CardBody className="flex-grow-1 d-flex flex-column">
        <CardTitle className="mb-4">
            <i className="bx bx-cart me-1"></i>
            Venda Atual
            {returnMode && <Badge color="warning" className="ms-2">Devolução</Badge>}
        </CardTitle>

        {/* Cart Items */}
        <div className="table-responsive flex-grow-1" style={{ minHeight: '300px', maxHeight: 'calc(100vh - 450px)', overflowY: 'auto' }}>
          <Table className="table-nowrap">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    <i className="bx bx-shopping-bag font-size-24 d-block mb-2"></i>
                    Carrinho vazio
                  </td>
                </tr>
              ) : (
                cart.map((item, index) => (
                  <tr key={item.variation_id || item.product_id}>
                    <td>
                      <div className="text-truncate" style={{maxWidth: '150px'}}>
                        {item.product_name}
                        {(item.color || item.size) && 
                            <small className="text-muted d-block">
                                {item.color}{item.size && `, ${item.size}`}
                            </small>
                        }
                      </div>
                    </td>
                    <td>
                      <Input
                        type="number"
                        bsSize="sm"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value, 10))}
                        min={returnMode ? -Infinity : 1}
                        style={{ width: "65px" }}
                        disabled={isCartDisabled}
                      />
                    </td>
                    <td>R$ {calculateItemTotal(item).toFixed(2)}</td>
                    <td>
                      <Button color="danger" size="sm" outline onClick={() => handleRemoveItem(index)} disabled={isCartDisabled}>
                        <i className="bx bx-trash-alt"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Financial Summary */}
        <div className="mt-auto pt-3 border-top">
            <div className="d-flex justify-content-between font-size-14">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between font-size-14">
                <span>Descontos:</span>
                <span className="text-danger">- R$ {calculateTotalDiscount().toFixed(2)}</span>
            </div>
            <hr className="my-2"/>
            <div className="d-flex justify-content-between font-size-22 fw-bold mt-2">
                <span>Total:</span>
                <span className="text-primary">R$ {totalAmount.toFixed(2)}</span>
            </div>
        </div>
      </CardBody>

      {/* Action Buttons */}
      <CardBody className="pt-0">
        <div className="d-grid gap-2">
          <Button color="success" size="lg" onClick={handleFinalizeSale} disabled={isCartDisabled || cart.length === 0}>
            <i className="bx bx-check-double me-1"></i> Finalizar Venda (F4)
          </Button>
          <div className="d-flex gap-2">
            <Button color="info" outline className="w-100" onClick={handleSuspendSale} disabled={isCartDisabled || cart.length === 0}>
              <i className="bx bx-pause me-1"></i> Suspender (F9)
            </Button>
            <Button color="secondary" outline className="w-100" onClick={handleClearSale} disabled={isCartDisabled && cart.length === 0}>
              <i className="bx bx-x me-1"></i> Limpar (ESC)
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default SaleColumn;
