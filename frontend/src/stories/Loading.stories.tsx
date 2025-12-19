import type { Meta, StoryObj } from '@storybook/react';
import Loading from '../components/Loading';

const meta: Meta<typeof Loading> = {
  title: 'Components/UI/Loading',
  component: Loading,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const Default: Story = {};
