import React, { useContext } from 'react';
import { Card, CardBody, Badge, Button, Col, CardImg, Input } from 'reactstrap';
import { NumericFormat } from 'react-number-format';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

import { ProductContext } from '../../../context/ProductContext';
import placeholderImage from '../../../assets/images/placeholder.svg';

// Estilos SCSS podem ser importados aqui se necessário
import './ProductCard.scss';

const ProductCard = React.memo(({ product, onEdit, onDelete, onQuickView }) => {
  const { selection } = useContext(ProductContext);
  const { selectedProducts, toggleProductSelection } = selection;
  const isSelected = selectedProducts.has(product.id);

  const { name, description, productType, variations = [], category } = product;
  const mainImage = variations.find((v) => v.image_url)?.image_url || placeholderImage;

  // Calcula o preço e o estoque total ou faixas
  const getPriceRange = () => {
    if (!variations || variations.length === 0) return 'R$ 0,00';
    if (variations.length === 1)
      return (
        <NumericFormat
          decimalSeparator=','
          displayType={'text'}
          prefix={'R$ '}
          thousandSeparator='.'
          value={variations[0].price}
        />
      );

    const prices = variations.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice)
      return (
        <NumericFormat
          decimalSeparator=','
          displayType={'text'}
          prefix={'R$ '}
          thousandSeparator='.'
          value={minPrice}
        />
      );

    return (
      <>
        <NumericFormat
          decimalSeparator=','
          displayType={'text'}
          prefix={'R$ '}
          thousandSeparator='.'
          value={minPrice}
        />
        {' - '}
        <NumericFormat
          decimalSeparator=','
          displayType={'text'}
          prefix={'R$ '}
          thousandSeparator='.'
          value={maxPrice}
        />
      </>
    );
  };

  const totalStock = variations.reduce((acc, v) => acc + (v.stock_quantity || 0), 0);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className='product-card-wrapper' // Removido classes de coluna, pois o pai ProductGrid já as define
      variants={itemVariants}
    >
      <Card className={`product-card ${isSelected ? 'selected' : ''}`}>
        <div className='product-selection-checkbox'>
          <Input
            checked={isSelected}
            type='checkbox'
            onChange={() => toggleProductSelection(product.id)}
          />
        </div>
        <div className='product-image-container'>
          <CardImg top alt={name} className='product-image' loading='lazy' src={mainImage} />
          <Badge
            className='product-type-badge'
            color={productType === 'physical' ? 'info' : 'secondary'}
          >
            {productType === 'physical' ? 'Físico' : 'Serviço'}
          </Badge>
          <div className='card-actions'>
            <Button
              className='action-btn themed-action-btn'
              size='sm'
              onClick={() => onQuickView(product)}
            >
              <i className='bx bx-search-alt'></i>
            </Button>
            <Button
              className='action-btn themed-action-btn'
              size='sm'
              onClick={() => onEdit(product)}
            >
              <i className='bx bx-pencil'></i>
            </Button>
            <Button
              className='action-btn themed-action-btn'
              size='sm'
              onClick={() => onDelete(product)}
            >
              <i className='bx bx-trash-alt'></i>
            </Button>
          </div>
        </div>
        <CardBody className='d-flex flex-column'>
          {category?.name && <p className='text-muted mb-1 fs-12'>{category.name}</p>}
          <h5 className='card-title flex-grow-1'>{name}</h5>

          <div className='d-flex justify-content-between align-items-center mt-3'>
            <div className='price-range fw-bold fs-5'>{getPriceRange()}</div>
            <div className='stock-info'>
              <Badge pill color={totalStock > 0 ? 'success' : 'danger'}>
                Estoque: {totalStock}
              </Badge>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onQuickView: PropTypes.func.isRequired,
};

export default ProductCard;
