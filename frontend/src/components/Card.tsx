import React from 'react';
import {
  StyledCard,
  StyledCardHeader,
  StyledCardContent,
  StyledCardFooter,
  StyledCardActions,
} from './Card.styled'; // Importar novos styled components

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * The elevation of the card, which controls the box-shadow.
   * @default 'sm'
   */
  elevation?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * If true, the card will have interactive hover effects.
   * @default false
   */
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  elevation = 'sm',
  interactive = false,
  ...props
}) => {
  return (
    <StyledCard elevation={elevation} interactive={interactive} {...props}>
      {children}
    </StyledCard>
  );
};

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardSectionProps> = ({ children, ...props }) => {
  return <StyledCardHeader {...props}>{children}</StyledCardHeader>;
};

export const CardContent: React.FC<CardSectionProps> = ({ children, ...props }) => {
  return <StyledCardContent {...props}>{children}</StyledCardContent>;
};

export const CardFooter: React.FC<CardSectionProps> = ({ children, ...props }) => {
  return <StyledCardFooter {...props}>{children}</StyledCardFooter>;
};

export const CardActions: React.FC<CardSectionProps> = ({ children, ...props }) => {
  return <StyledCardActions {...props}>{children}</StyledCardActions>;
};

export default Card;
