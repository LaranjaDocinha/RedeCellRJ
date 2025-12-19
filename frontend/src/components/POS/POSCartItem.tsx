import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaTrash } from 'react-icons/fa';

interface CartItemType {
  id: number;
  product_name?: string;
  color: string;
  price: string;
  quantity: number;
  subtotal: number;
  image_url?: string;
}

interface POSCartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, newQuantity: number) => void;
  onRemove: (id: number) => void;
}

const ItemWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const ItemDetails = styled.div`
  flex-grow: 1;
`;

const ItemName = styled.h4`
  font-weight: 600;
  margin: 0;
`;

const ItemColor = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

const QuantityInput = styled.input.attrs(props => ({
  type: 'number',
  step: 'any', // Allow decimal input
}))`
  width: 40px;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 0.25rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ItemSubtotal = styled.div`
  font-weight: 700;
  min-width: 70px;
  text-align: right;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.danger};
  cursor: pointer;
  padding: 0.5rem;
  &:hover {
    opacity: 0.7;
  }
`;

const POSCartItem: React.FC<POSCartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <ItemWrapper
      layout
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
    >
      <ItemImage src={item.image_url || '/placeholder-image.png'} alt={item.product_name} />
      <ItemDetails>
        <ItemName>{item.product_name}</ItemName>
        <ItemColor>{item.color}</ItemColor>
      </ItemDetails>
      <QuantitySelector>
        <QuantityButton onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>-</QuantityButton>
        <QuantityInput
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(item.id, parseFloat(e.target.value) || 0)} // Parse as float
        />
        <QuantityButton onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</QuantityButton>
      </QuantitySelector>
      <ItemSubtotal>R$ {item.subtotal.toFixed(2)}</ItemSubtotal>
      <RemoveButton onClick={() => onRemove(item.id)}>
        <FaTrash />
      </RemoveButton>
    </ItemWrapper>
  );
};

export default POSCartItem;
