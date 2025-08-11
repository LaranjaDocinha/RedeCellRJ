import React from 'react';

import WidgetContainer from './WidgetContainer';

const LowStockProducts = ({ products }) => {
  return (
    <WidgetContainer style={{ height: '100%' }} title='Produtos com Baixo Estoque'>
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <table className='table table-striped'>
          <thead>
            <tr>
              <th>Produto</th>
              <th className='text-end'>Estoque</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td className='text-end'>{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetContainer>
  );
};

export default LowStockProducts;
