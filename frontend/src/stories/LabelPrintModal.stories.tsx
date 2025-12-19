import type { Meta, StoryObj } from '@storybook/react';
import LabelPrintModal from '../components/ProductCatalog/LabelPrintModal';
import { NotificationProvider } from '../contexts/NotificationContext';
import { fn } from '@storybook/test';

// Mock printer utils
jest.mock('../utils/printer', () => ({
    connectToPrinter: jest.fn().mockResolvedValue({
        transferOut: jest.fn().mockResolvedValue(undefined)
    }),
}));

const mockProducts = [
    { id: 1, name: 'iPhone 13', sku: 'IPH13', variations: [{ price: 4500 }] },
    { id: 2, name: 'Samsung S22', sku: 'SAM22', variations: [{ price: 3200 }] },
];

const meta: Meta<typeof LabelPrintModal> = {
  title: 'ProductCatalog/Modals/LabelPrintModal',
  component: LabelPrintModal,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <NotificationProvider>
            <Story />
        </NotificationProvider>
    ),
  ],
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof LabelPrintModal>;

export const Open: Story = {
  args: {
    open: true,
    products: mockProducts,
  },
};
