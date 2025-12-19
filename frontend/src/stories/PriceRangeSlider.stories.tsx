import type { Meta, StoryObj } from '@storybook/react';
import { PriceRangeSlider } from '../components/PriceRangeSlider';

const meta = {
  title: 'Components/PriceRangeSlider',
  component: PriceRangeSlider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    min: { control: 'number', description: 'Valor mínimo do slider.' },
    max: { control: 'number', description: 'Valor máximo do slider.' },
    onChange: { action: 'valueChanged', description: 'Função chamada quando a faixa de preço muda.' },
    title: { control: 'text', description: 'Título da seção do slider.' },
  },
} satisfies Meta<typeof PriceRangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    min: 0,
    max: 1000,
    title: 'Filtre por Preço',
  },
};

export const NarrowRange: Story = {
    args: {
      min: 50,
      max: 200,
      title: 'Promoções',
    },
  };