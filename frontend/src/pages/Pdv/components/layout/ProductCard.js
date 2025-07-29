import React from 'react';
import { Card, CardBody, Badge, Col, CardImg } from 'reactstrap';
import { NumericFormat } from 'react-number-format';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

import placeholderImage from '../../../../assets/images/placeholder.svg';

// Importando o SCSS do componente padronizado
import '../../../Products/components/ProductCard.scss';

const ProductCard = React.memo(({ product, onCardClick, isDisabled }) => {
  const { name, variations = [], category } = product;
  const mainImage = variations.find((v) => v.image_url)?.image_url || placeholderImage;

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

  const cardClasses = `product-card h-100 ${isDisabled || totalStock <= 0 ? 'disabled' : ''}`;
  const cardCursor = isDisabled || totalStock <= 0 ? 'not-allowed' : 'pointer';

  return (
    <motion.div
      className='col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4 product-card-col'
      style={{ cursor: cardCursor }}
      variants={itemVariants}
      onClick={!isDisabled && totalStock > 0 ? onCardClick : undefined}
    >
      <Card className={cardClasses}>
        <div className='product-image-container'>
          <CardImg top alt={name} className='product-image' loading='lazy' src={mainImage} />
          {/* No PDV, talvez a badge de tipo não seja necessária, mas o estoque é */}
          <Badge
            className='product-type-badge'
            color={totalStock > 10 ? 'success' : totalStock > 0 ? 'warning' : 'danger'}
          >
            Estoque: {totalStock}
          </Badge>
        </div>
        <CardBody className='d-flex flex-column'>
          {category?.name && <p className='text-muted mb-1 fs-12'>{category.name}</p>}
          <h5 className='card-title flex-grow-1'>{name}</h5>

          <div className='d-flex justify-content-between align-items-center mt-3'>
            <div className='price-range fw-bold fs-5'>{getPriceRange()}</div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  onCardClick: PropTypes.func,
  isDisabled: PropTypes.bool,
};

ProductCard.defaultProps = {
  onCardClick: () => {},
  isDisabled: false,
};

export default ProductCard;
