import type { Meta, StoryObj } from '@storybook/react';
import ToggleButton from '../components/ToggleButton';
import { fn } from '@storybook/test';
import { FaCheck } from 'react-icons/fa';

const meta: Meta<typeof ToggleButton> = {
  title: 'Components/Forms/ToggleButton',
  component: ToggleButton,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ToggleButton>;

export const Selected: Story = {
  args: {
    value: 'option1',
    selected: true,
    label: 'Option 1',
    icon: <FaCheck />,
  },
};

export const Unselected: Story = {
  args: {
    value: 'option2',
    selected: false,
    label: 'Option 2',
  },
};
