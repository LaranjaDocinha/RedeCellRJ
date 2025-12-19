import type { Meta, StoryObj } from '@storybook/react';
import { RatingStars } from '../components/RatingStars';

const meta = {
  title: 'Components/RatingStars',
  component: RatingStars,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number', description: 'O valor da avaliação (0 a 5).' },
    onChange: { action: 'ratingChanged', description: 'Função chamada quando a avaliação muda.' },
    readOnly: { control: 'boolean', description: 'Se a avaliação é apenas para leitura.' },
    size: { control: { type: 'select' }, options: ['small', 'medium', 'large'], description: 'Tamanho das estrelas.' },
    precision: { control: { type: 'select' }, options: [0.5, 1], description: 'Precisão da avaliação (meia ou inteira estrela).' },
    showValue: { control: 'boolean', description: 'Exibe o valor numérico ao lado das estrelas.' },
  },
} satisfies Meta<typeof RatingStars>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = {
  args: {
    value: 4.5,
    readOnly: true,
    showValue: true,
  },
};

export const Interactive: Story = {
  args: {
    value: 3,
    readOnly: false,
  },
};

export const LargeAndFullStars: Story = {
    args: {
      value: 4,
      readOnly: true,
      size: 'large',
      precision: 1,
      showValue: true,
    },
  };