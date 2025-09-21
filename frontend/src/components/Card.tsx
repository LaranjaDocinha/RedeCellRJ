import React from 'react';
import { StyledCard } from './Card.styled';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <StyledCard className={className} {...props}>
      {children}
    </StyledCard>
  );
};

export default Card;
