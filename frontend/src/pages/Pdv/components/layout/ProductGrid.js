import React from 'react';
import { Row, Col } from 'reactstrap';
import { motion } from 'framer-motion';

import ProductCard from '../../../Products/components/ProductCard'; // Caminho atualizado

const ProductGrid = ({ products, addToCart, isPdvDisabled }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  // Adapta a função para o ProductCard padronizado
  const handleCardClick = (product) => {
    if (!isPdvDisabled) {
      addToCart(product.variations?.[0] || product, product);
    }
  };

  return (
    <motion.div
      animate='visible'
      className='product-grid-container'
      initial='hidden'
      style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
      variants={containerVariants}
    >
      {products.length > 0 ? (
        <Row className='g-3'>
          {products.map((product) => (
            <Col key={product.id} md={4} sm={6} xl={3}>
              <ProductCard
                isDisabled={isPdvDisabled || (product.variations?.[0]?.stock_quantity || 0) <= 0}
                product={product}
                onCardClick={() => handleCardClick(product)}
                onDelete={() => {}}
                onEdit={() => {}}
                onQuickView={() => {}}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <div className='text-center p-5'>
          <i className='bx bx-store-alt font-size-48 text-muted'></i>
          <h5 className='mt-3'>Bem-vindo ao Ponto de Venda</h5>
          <p className='text-muted'>
            Use a busca para encontrar produtos ou selecione uma categoria.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ProductGrid;
