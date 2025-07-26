import React from 'react';
import { Card, CardBody, CardImg, CardTitle, CardText, Button, Badge } from 'reactstrap';

const ProductCard = ({ product, onAddToCart, isDisabled }) => {
  const getStockStatusColor = (stock) => {
    if (stock > 20) return 'success';
    if (stock > 0) return 'warning';
    return 'danger';
  };

  // Pega o preço e o estoque da primeira variação, se existir.
  const firstVariation = product.variations?.[0];
  const displayPrice = firstVariation?.price || 0;
  const stockQuantity = firstVariation?.stock_quantity || 0;

  return (
    <Card 
        className={`product-card h-100 ${isDisabled || stockQuantity <= 0 ? 'disabled' : ''}`} 
        onClick={!isDisabled && stockQuantity > 0 ? onAddToCart : undefined}
        style={{ cursor: isDisabled || stockQuantity <= 0 ? 'not-allowed' : 'pointer' }}
    >
      <div className="position-relative">
        <CardImg
          top
          width="100%"
          src={product.image_url || firstVariation?.image_url || ''}
          alt={product.name}
          className="p-3"
          style={{ objectFit: 'contain', height: '120px' }}
        />
        <Badge 
            color={getStockStatusColor(stockQuantity)} 
            className="position-absolute top-0 end-0 m-2"
            pill
        >
            Est: {stockQuantity}
        </Badge>
      </div>
      <CardBody className="text-center d-flex flex-column">
        <CardTitle tag="h6" className="text-truncate mb-2" title={product.name}>
          {product.name}
        </CardTitle>
        <CardText className="fw-bold font-size-16 mt-auto">
          R$ {parseFloat(displayPrice).toFixed(2)}
        </CardText>
        {/* O botão foi removido para que o card inteiro seja clicável */}
      </CardBody>
    </Card>
  );
};

export default ProductCard;
