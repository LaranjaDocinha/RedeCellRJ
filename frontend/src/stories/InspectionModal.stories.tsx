import type { Meta, StoryObj } from '@storybook/react';
import InspectionModal from '../components/InspectionModal';
import { ThemeProvider } from 'styled-components';
import { fn } from '@storybook/test';

const theme = {
  colors: {
    surface: '#FFFFFF',
    primary: '#6200EE',
    onPrimary: '#FFFFFF',
    outline: '#E0E0E0',
    danger: '#B00020',
  },
  spacing: { md: '16px', lg: '24px' },
  borderRadius: { medium: '4px', large: '8px' },
  shadows: { elevation2: '0 3px 6px rgba(0,0,0,0.16)' },
};

const meta: Meta<typeof InspectionModal> = {
  title: 'Components/Modals/InspectionModal',
  component: InspectionModal,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
  args: {
    onClose: fn(),
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof InspectionModal>;

export const Default: Story = {
  args: {
    item: {
      product_name: 'iPhone 13 128GB',
      customer_name: 'Maria Silva',
      quantity: 1,
    },
  },
};
