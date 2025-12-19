import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from '../components/LoadingSpinner';

const meta = {
  title: 'Components/Loading/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    fullscreen: { control: 'boolean', description: 'Exibe o spinner em tela cheia com overlay.' },
    size: { control: 'number', description: 'O tamanho do spinner.' },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fullscreen: false,
    size: 50,
  },
};

export const Fullscreen: Story = {
    args: {
      fullscreen: true,
      size: 80,
    },
  };