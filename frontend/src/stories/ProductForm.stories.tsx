import type { Meta, StoryObj } from '@storybook/react';
import ProductForm from '../components/ProductForm';
import { fn } from '@storybook/test';
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    error: '#B00020',
    onSurface: '#000000',
    surface: '#FFFFFF',
    primary: '#6200EE',
    onPrimary: '#FFFFFF',
    outline: '#E0E0E0',
  },
  typography: {
    body2: { fontSize: '14px' },
    caption: { fontSize: '12px' },
  },
  spacing: { md: '16px' },
  borderRadius: { medium: '4px' },
};

const meta: Meta<typeof ProductForm> = {
  title: 'Components/Forms/ProductForm',
  component: ProductForm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
  args: {
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ProductForm>;

export const NewProduct: Story = {
  args: {
    initialData: null,
  },
};

export const EditProduct: Story = {
  args: {
    initialData: {
      name: 'iPhone 13',
      description: 'Smartphone Apple',
      sku: 'IPH-13-128',
      branch_id: 1,
      imageUrl: 'https://via.placeholder.com/150',
      variations: [{ color: 'Midnight', price: 4500, stock_quantity: 10 }],
    },
  },
};
