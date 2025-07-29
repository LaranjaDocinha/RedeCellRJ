import React from 'react';
import './Receipt.css';

const Receipt = React.forwardRef(({ saleData }, ref) => {
  if (!saleData) return null;

  const {
    saleId,
    totalAmount,
    totalPaid,
    change,
    items,
    customer,
    timestamp,
    saleDiscount,
    notes,
  } = saleData;

  const subtotal = items.reduce((acc, item) => {
    return acc + item.unitPrice * item.quantity;
  }, 0);

  const totalDiscount = subtotal - totalAmount;

  return (
    <div ref={ref} className='receipt-container'>
      <div className='receipt-header'>
        <h2>Recibo de Venda</h2>
        <p>
          <strong>Loja de Celular PDV</strong>
        </p>
        <p>Rua Fictícia, 123, Centro</p>
        <p>Telefone: (99) 99999-9999</p>
      </div>

      <div className='receipt-info'>
        <p>
          <strong>Venda ID:</strong> {saleId}
        </p>
        <p>
          <strong>Data:</strong> {new Date(timestamp).toLocaleString('pt-BR')}
        </p>
        {customer && (
          <p>
            <strong>Cliente:</strong> {customer.name}
          </p>
        )}
      </div>

      <table className='receipt-table'>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Qtd.</th>
            <th>Preço Unit.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.variationId}>
              <td>
                {item.productName} ({item.color})
              </td>
              <td>{item.quantity}</td>
              <td>R$ {parseFloat(item.unitPrice).toFixed(2)}</td>
              <td>R$ {(item.quantity * item.unitPrice).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className='receipt-totals'>
        <p>
          <strong>Subtotal:</strong> R$ {subtotal.toFixed(2)}
        </p>
        {totalDiscount > 0 && (
          <p>
            <strong>Descontos:</strong> - R$ {totalDiscount.toFixed(2)}
          </p>
        )}
        <p className='total-amount'>
          <strong>Total:</strong> R$ {parseFloat(totalAmount).toFixed(2)}
        </p>
        <hr />
        <p>
          <strong>Total Pago:</strong> R$ {parseFloat(totalPaid).toFixed(2)}
        </p>
        <p>
          <strong>Troco:</strong> R$ {parseFloat(change).toFixed(2)}
        </p>
      </div>

      {notes && (
        <div className='receipt-notes'>
          <p>
            <strong>Observações:</strong>
          </p>
          <p>{notes}</p>
        </div>
      )}

      <div className='receipt-footer'>
        <p>Obrigado pela sua preferência!</p>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

export default Receipt;
