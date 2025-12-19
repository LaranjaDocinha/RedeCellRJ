import type { Meta, StoryObj } from '@storybook/react';
import CustomerScanner from '../components/CustomerScanner';

const meta: Meta<typeof CustomerScanner> = {
  title: 'Components/CustomerScanner',
  component: CustomerScanner,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CustomerScanner>;

export const Default: Story = {};
