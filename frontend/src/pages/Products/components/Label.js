import React from 'react';
import Barcode from 'react-barcode';
import './Label.css';

const Label = React.forwardRef(({ product }, ref) => {
  if (!product) return null;

  return (
    <div ref={ref} className="label-container">
      <div className="label-content">
        <p className="label-product-name" title={product.name}>
          {product.name}
        </p>
        {product.color && <p className="label-variation">Variação: {product.color}</p>}
        <p className="label-price">
          R$ {parseFloat(product.price || 0).toFixed(2)}
        </p>
        {product.barcode && (
          <div className="label-barcode">
            <Barcode 
              value={product.barcode} 
              height={40}
              width={1.5}
              fontSize={10}
              margin={5}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default Label;
