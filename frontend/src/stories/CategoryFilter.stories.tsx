import type { Meta, StoryObj } from '@storybook/react';
import { CategoryFilter } from '../components/CategoryFilter';

const meta = {
  title: 'Components/CategoryFilter',
  component: CategoryFilter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    categories: { control: 'object', description: 'Lista de categorias para exibir.' },
    onFilterChange: { action: 'filterChanged', description: 'Função chamada quando a seleção muda.' },
    title: { control: 'text', description: 'Título da seção de filtro.' },
  },
} satisfies Meta<typeof CategoryFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCategories = [
  { id: '1', name: 'Eletrônicos', count: 120 },
  { id: '2', name: 'Roupas', count: 85 },
  { id: '3', name: 'Livros', count: 210 },
  { id: '4', name: 'Casa e Cozinha', count: 50 },
  { id: '5', name: 'Esportes', count: 78 },
  { id: '6', name: 'Brinquedos', count: 0 }, // Exemplo de filtro desabilitado
];

export const Default: Story = {
  args: {
    categories: sampleCategories,
    title: 'Filtre por Categoria',
  },
};

export const NoTitle: Story = {
    args: {
      categories: sampleCategories,
      title: '',
    },
  };