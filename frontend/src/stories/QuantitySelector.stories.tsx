import type { Meta, StoryObj } from '@storybook/react';
import { QuantitySelector } from '../components/QuantitySelector';

const meta = {
  title: 'Components/QuantitySelector',
  component: QuantitySelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    max: { control: 'number', description: 'Quantidade máxima permitida (estoque).' },
    initialValue: { control: 'number', description: 'Valor inicial do seletor.' },
    onChange: { action: 'quantityChanged', description: 'Função chamada quando a quantidade muda.' },
  },
} satisfies Meta<typeof QuantitySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    max: 10,
    initialValue: 1,
  },
};

export const LimitedStock: Story = {
    args: {
      max: 3,
      initialValue: 2,
    },
  };