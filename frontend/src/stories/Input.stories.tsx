import type { Meta, StoryObj } from '@storybook/react';
import Input from '../components/Input';
import { FaSearch, FaUser } from 'react-icons/fa';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    status: {
      control: 'select',
      options: ['none', 'success', 'error'],
    },
    type: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'Email is invalid',
    defaultValue: 'invalid-email',
  },
};

export const Success: Story = {
  args: {
    label: 'Full Name',
    status: 'success',
    defaultValue: 'John Doe',
  },
};

export const WithStartAdornment: Story = {
  args: {
    label: 'Search',
    startAdornment: <FaSearch />,
    placeholder: 'Search products...',
  },
};

export const WithEndAdornment: Story = {
  args: {
    label: 'User',
    endAdornment: <FaUser />,
    defaultValue: 'admin',
  },
};

export const Small: Story = {
  args: {
    label: 'Small Input',
    size: 'small',
    placeholder: 'Small size',
  },
};

export const Large: Story = {
  args: {
    label: 'Large Input',
    size: 'large',
    placeholder: 'Large size',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    disabled: true,
    defaultValue: 'Cannot edit this',
  },
};

export const HelperText: Story = {
  args: {
    label: 'Phone Number',
    helperText: 'Format: (00) 00000-0000',
    placeholder: '(11) 99999-9999',
  },
};
