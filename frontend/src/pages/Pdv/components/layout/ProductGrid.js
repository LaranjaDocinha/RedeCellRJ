import React from 'react';
import { Row, Col } from 'reactstrap';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, addToCart, isPdvDisabled }) => {
  return (
    <div className="product-grid-container" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {products.length > 0 ? (
            <Row className="g-3">
                {products.map(product => (
                    <Col key={product.id} xl={3} md={4} sm={6}>
                        <ProductCard 
                            product={product} 
                            onAddToCart={(e) => addToCart(product.variations?.[0] || product, product, e)}
                            isDisabled={isPdvDisabled}
                        />
                    </Col>
                ))}
            </Row>
        ) : (
            <div className="text-center p-5">
                <i className="bx bx-store-alt font-size-48 text-muted"></i>
                <h5 className="mt-3">Bem-vindo ao Ponto de Venda</h5>
                <p className="text-muted">Use a busca para encontrar produtos ou selecione uma categoria.</p>
            </div>
        )}
    </div>
  );
};

export default ProductGrid;
