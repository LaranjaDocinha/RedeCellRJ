import type { Meta, StoryObj } from '@storybook/react';
import { ErrorMessage } from '../components/ErrorMessage';

const meta: Meta<typeof ErrorMessage> = {
  title: 'Components/UI/ErrorMessage',
  component: ErrorMessage,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorMessage>;

export const Default: Story = {
  args: {
    message: 'Algo deu errado.',
  },
};

export const WithDetails: Story = {
  args: {
    message: 'Erro de Validação',
    details: 'O campo email é obrigatório.',
  },
};
