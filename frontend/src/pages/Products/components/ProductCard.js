import React, { useContext } from 'react';
import { Card, CardBody, Badge, Button, Col, CardImg, Input } from 'reactstrap';
import { NumericFormat } from 'react-number-format';
import PropTypes from 'prop-types';
import { ProductContext } from '../../../context/ProductContext';
import placeholderImage from '../../../assets/images/placeholder.svg';

// Estilos SCSS podem ser importados aqui se necessário
import './ProductCard.scss';

const ProductCard = React.memo(({ product, onEdit, onDelete, onQuickView }) => {
  const { selection } = useContext(ProductContext);
  const { selectedProducts, toggleProductSelection } = selection;
  const isSelected = selectedProducts.has(product.id);

  const { name, description, productType, variations = [], category } = product;
  const mainImage = variations.find(v => v.image_url)?.image_url || placeholderImage;

  // Calcula o preço e o estoque total ou faixas
  const getPriceRange = () => {
    if (!variations || variations.length === 0) return 'R$ 0,00';
    if (variations.length === 1) return <NumericFormat value={variations[0].price} displayType={'text'} thousandSeparator="." decimalSeparator="," prefix={'R$ '} />;
    
    const prices = variations.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) return <NumericFormat value={minPrice} displayType={'text'} thousandSeparator="." decimalSeparator="," prefix={'R$ '} />;

    return (
      <>
        <NumericFormat value={minPrice} displayType={'text'} thousandSeparator="." decimalSeparator="," prefix={'R$ '} />
        {' - '}
        <NumericFormat value={maxPrice} displayType={'text'} thousandSeparator="." decimalSeparator="," prefix={'R$ '} />
      </>
    );
  };

  const totalStock = variations.reduce((acc, v) => acc + (v.stock_quantity || 0), 0);

  return (
    <Col xl={3} lg={4} md={6} sm={12} className="mb-4 product-card-col">
      <Card className={`product-card ${isSelected ? 'selected' : ''}`}>
        <div className="product-selection-checkbox">
          <Input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => toggleProductSelection(product.id)}
          />
        </div>
        <div className="product-image-container">
          <CardImg top src={mainImage} alt={name} className="product-image" loading="lazy" />
          <Badge color={productType === 'physical' ? 'info' : 'secondary'} className="product-type-badge">
            {productType === 'physical' ? 'Físico' : 'Serviço'}
          </Badge>
           <div className="card-actions">
              <Button size="sm" className="action-btn themed-action-btn" onClick={() => onQuickView(product)}>
                <i className="bx bx-search-alt"></i>
              </Button>
              <Button size="sm" className="action-btn themed-action-btn" onClick={() => onEdit(product)}>
                <i className="bx bx-pencil"></i>
              </Button>
              <Button size="sm" className="action-btn themed-action-btn" onClick={() => onDelete(product)}>
                <i className="bx bx-trash-alt"></i>
              </Button>
            </div>
        </div>
        <CardBody className="d-flex flex-column">
          {category?.name && <p className="text-muted mb-1 fs-12">{category.name}</p>}
          <h5 className="card-title flex-grow-1">{name}</h5>
          
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="price-range fw-bold fs-5">
              {getPriceRange()}
            </div>
            <div className="stock-info">
              <Badge color={totalStock > 0 ? 'success' : 'danger'} pill>
                Estoque: {totalStock}
              </Badge>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
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