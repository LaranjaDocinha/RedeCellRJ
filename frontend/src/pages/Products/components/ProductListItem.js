import React, { useContext } from 'react';
import { Badge, Button, Input } from 'reactstrap';
import { NumericFormat } from 'react-number-format';
import PropTypes from 'prop-types';

import { ProductContext } from '../../../context/ProductContext';
import placeholderImage from '../../../assets/images/placeholder.svg';
import './ProductListItem.scss';

const ProductListItem = React.memo(({ product, onEdit, onDelete, onQuickView }) => {
  const { selection } = useContext(ProductContext);
  const { selectedProducts, toggleProductSelection } = selection;
  const isSelected = selectedProducts.has(product.id);

  const { name, category, variations, productType } = product;

  const mainImage = variations.find((v) => v.image_url)?.image_url || placeholderImage;
  const totalStock = variations.reduce((acc, v) => acc + (v.stock_quantity || 0), 0);

  const getPrice = () => {
    if (!variations || variations.length === 0) return 'R$ 0,00';
    const price = variations[0].price;
    return (
      <NumericFormat
        decimalSeparator=','
        displayType={'text'}
        prefix={'R$ '}
        thousandSeparator='.'
        value={price}
      />
    );
  };

  return (
    <div className={`product-list-item-wrapper ${isSelected ? 'selected' : ''}`}>
      <div className='product-list-item'>
        <div className='product-list-item__selection'>
          <Input
            checked={isSelected}
            type='checkbox'
            onChange={() => toggleProductSelection(product.id)}
          />
        </div>
        <div className='product-list-item__image'>
          <img alt={name} loading='lazy' src={mainImage} />
        </div>
        <div className='product-list-item__info' title={name}>
          <h6 className='mb-0'>{name}</h6>
          <small className='text-muted' title={category?.name}>
            {category?.name || 'Sem categoria'}
          </small>
        </div>
        <div className='product-list-item__price'>{getPrice()}</div>
        <div className='product-list-item__stock'>
          <Badge pill color={totalStock > 0 ? 'success' : 'danger'}>
            Estoque: {totalStock}
          </Badge>
        </div>
        <div className='product-list-item__type'>
          <Badge pill color={productType === 'physical' ? 'info' : 'secondary'}>
            {productType === 'physical' ? 'Físico' : 'Serviço'}
          </Badge>
        </div>
        <div className='product-list-item__actions'>
          <Button className='themed-action-btn' size='sm' onClick={() => onQuickView(product)}>
            <i className='bx bx-search-alt'></i>
          </Button>
          <Button className='themed-action-btn' size='sm' onClick={() => onEdit(product)}>
            <i className='bx bx-pencil'></i>
          </Button>
          <Button className='themed-action-btn' size='sm' onClick={() => onDelete(product)}>
            <i className='bx bx-trash-alt'></i>
          </Button>
        </div>
      </div>
    </div>
  );
});

ProductListItem.displayName = 'ProductListItem';

ProductListItem.propTypes = {
  product: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onQuickView: PropTypes.func.isRequired,
};

export default ProductListItem;
