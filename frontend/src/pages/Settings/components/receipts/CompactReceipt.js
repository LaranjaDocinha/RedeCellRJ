import React from 'react';

const CompactReceipt = React.forwardRef(({ settings }, ref) => (
  <div ref={ref} style={{ padding: '10px', fontFamily: 'monospace', fontSize: '10px', lineHeight: '1.2' }}>
    <h4 style={{ textAlign: 'center', marginBottom: '5px' }}>{settings.store_name || 'Loja'}</h4>
    <p style={{ textAlign: 'center', marginBottom: '5px' }}>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
    <p>--------------------</p>
    <p>Prod A x2 = R$20.00</p>
    <p>Serv B x1 = R$15.00</p>
    <p>--------------------</p>
    <p>Total: R$35.00</p>
    <p style={{ textAlign: 'center', marginTop: '5px' }}>Volte Sempre!</p>
  </div>
));

export default CompactReceipt;
