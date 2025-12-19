// frontend/src/components/ProductCatalog/ProductCard.tsx
import React, { useContext } from 'react';
import { Part } from '../../types/part';
import { useCart } from '../../contexts/CartContext'; // Precisaremos verificar este caminho e conteúdo

interface ProductCardProps {
  product: Part;
  onProductClick?: (product: Part) => void; // Adicionada a prop onProductClick
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const { addToCart } = useCart();

  const handleClick = () => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      addToCart(product); // Fallback para o contexto se onProductClick não for fornecido
    }
  };

  return (
    <div
      style={{ border: '1px solid #ccc', padding: '10px', margin: '10px', borderRadius: '5px', cursor: 'pointer' }}
      tabIndex={0} // Make the div focusable
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Placeholder image with lazy loading */}
      <img
        src={product.image_url || 'https://via.placeholder.com/150'} // Use product image_url or a placeholder
        alt={product.name}
        style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
        loading="lazy" // Lazy loading attribute
      />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>SKU: {product.sku}</p>
      {product.barcode && <p>Barcode: {product.barcode}</p>}
      <p>Stock: {product.stock_quantity}</p>
      {/* The button is now redundant as the div handles click/keydown */}
      {/* <button onClick={handleClick}>Add to Cart</button> */}
    </div>
  );
};

export default ProductCard;
