import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Button } from '../Button';

interface ProductVariation {
  id: number;
  product_id: number;
  color: string;
  price: string;
  stock_quantity: number;
  product_name?: string;
  image_url?: string;
}

interface POSProductCardProps {
  product: ProductVariation;
  onAddToCart: (product: ProductVariation) => void;
}

const CardWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.small};
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const CardImage = styled.div<{ imageUrl?: string }>`
  height: 120px;
  background-image: url(${({ imageUrl }) => imageUrl || '/placeholder-image.png'});
  background-size: cover;
  background-position: center;
`;

const CardContent = styled.div`
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 400;
  margin: 0 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductColor = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 0.5rem;
`;

const ProductPrice = styled.p`
  font-size: 1.1rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  margin-top: auto;
`;

const AddButton = styled(Button)`
  margin: 0.75rem;
`;


const POSProductCard: React.FC<POSProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <CardWrapper
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <CardImage imageUrl={product.image_url} />
      <CardContent>
        <ProductName title={product.product_name}>{product.product_name || 'Produto'}</ProductName>
        <ProductColor>{product.color}</ProductColor>
        <ProductPrice>R$ {parseFloat(product.price).toFixed(2)}</ProductPrice>
      </CardContent>
      <AddButton label="Adicionar" onClick={() => onAddToCart(product)} size="small" $fullWidth />
    </CardWrapper>
  );
};

export default POSProductCard;

