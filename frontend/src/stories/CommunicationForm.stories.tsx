import type { Meta, StoryObj } from '@storybook/react';
import CommunicationForm from '../components/CommunicationForm';
import { fn } from '@storybook/test';

const meta: Meta<typeof CommunicationForm> = {
  title: 'Components/Forms/CommunicationForm',
  component: CommunicationForm,
  tags: ['autodocs'],
  args: {
    onSubmit: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CommunicationForm>;

export const Default: Story = {
  args: {
    customerId: 123,
  },
};
