import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from '../components/EmptyState';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: { control: false },
    title: { control: 'text' },
    message: { control: 'text' },
    actionButtonLabel: { control: 'text' },
    onActionButtonClick: { action: 'clicked' },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Nenhum resultado encontrado',
    message: 'Tente ajustar sua busca ou filtros para encontrar o que você está procurando.',
  },
};

export const WithAction: Story = {
    args: {
      title: 'Seu carrinho está vazio',
      message: 'Adicione produtos ao seu carrinho para começar a comprar.',
      actionButtonLabel: 'Ver Produtos',
      icon: <ShoppingCartIcon sx={{ fontSize: 80 }} />,
    },
  };