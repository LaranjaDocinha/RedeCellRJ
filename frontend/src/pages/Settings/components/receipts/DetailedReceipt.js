import React from 'react';

const DetailedReceipt = React.forwardRef(({ settings }, ref) => (
  <div ref={ref} style={{ padding: '25px', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6' }}>
    <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>{settings.store_name || 'Nome da Loja Completo'}</h2>
    <p style={{ textAlign: 'center', marginBottom: '15px' }}>CNPJ: {settings.store_cnpj || '00.000.000/0000-00'}</p>
    <p>--------------------------------------------------</p>
    <p>Endereço: {settings.store_street || 'Rua Exemplo'}, {settings.store_number || '123'}</p>
    <p>Bairro: {settings.store_neighborhood || 'Centro'}</p>
    <p>Cidade/UF: {settings.store_city || 'Cidade'} - {settings.store_state || 'UF'} CEP: {settings.store_zip || '00000-000'}</p>
    <p>Telefone: {settings.store_phone || '(00) 00000-0000'}</p>
    <p>--------------------------------------------------</p>
    <p>Data: {new Date().toLocaleDateString()} Hora: {new Date().toLocaleTimeString()}</p>
    <p>--------------------------------------------------</p>
    <p>Descrição do Item        Qtd   Preço Unit.   Total</p>
    <p>--------------------------------------------------</p>
    <p>Produto A                2     R$ 10.00      R$ 20.00</p>
    <p>Serviço B                1     R$ 15.00      R$ 15.00</p>
    <p>--------------------------------------------------</p>
    <p>Subtotal:                               R$ 35.00</p>
    <p>Desconto:                               R$ 0.00</p>
    <p>Total Geral:                            R$ 35.00</p>
    <p>--------------------------------------------------</p>
    <p style={{ textAlign: 'center', marginTop: '15px' }}>Agradecemos a sua compra!</p>
    <p style={{ textAlign: 'center' }}>{settings.receiptTemplate || 'Modelo Padrão'}</p>
  </div>
));

export default DetailedReceipt;
