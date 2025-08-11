import React from 'react';

const StandardReceipt = React.forwardRef(({ settings }, ref) => (
  <div ref={ref} style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.5' }}>
    <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Recibo de Venda</h3>
    <p>------------------------------------</p>
    <p>Loja: {settings.store_name || 'Nome da Loja'}</p>
    <p>Endereço: {settings.store_street || 'Rua'}, {settings.store_number || 'S/N'}</p>
    <p>Bairro: {settings.store_neighborhood || 'Bairro'}</p>
    <p>Cidade: {settings.store_city || 'Cidade'} - {settings.store_state || 'UF'}</p>
    <p>CEP: {settings.store_zip || 'CEP'}</p>
    <p>Telefone: {settings.store_phone || 'Telefone da Loja'}</p>
    <p>------------------------------------</p>
    <p>Data: {new Date().toLocaleDateString()}</p>
    <p>Hora: {new Date().toLocaleTimeString()}</p>
    <p>------------------------------------</p>
    <p>Item 1: Produto A - R$ 10.00 x 2 = R$ 20.00</p>
    <p>Item 2: Serviço B - R$ 15.00 x 1 = R$ 15.00</p>
    <p>------------------------------------</p>
    <p>Subtotal: R$ 35.00</p>
    <p>Desconto: R$ 0.00</p>
    <p>Total: R$ 35.00</p>
    <p>------------------------------------</p>
    <p style={{ textAlign: 'center', marginTop: '10px' }}>Obrigado pela preferência!</p>
  </div>
));

export default StandardReceipt;
