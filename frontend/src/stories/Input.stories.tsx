import type { Meta, StoryObj } from '@storybook/react';
import Input from '../components/Input';
import { FaUser, FaLock, FaSearch } from 'react-icons/fa';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    startAdornment: { control: false },
    endAdornment: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Type something...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Email',
    placeholder: 'example@email.com',
    helperText: 'We will never share your email.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    value: 'invalid-email',
    error: 'Please enter a valid email address.',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
  },
};

export const WithStartAdornment: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    startAdornment: <FaSearch color="#666" />,
  },
};

export const WithEndAdornment: Story = {
  args: {
    label: 'Username',
    placeholder: 'username',
    endAdornment: <FaUser color="#666" />,
  },
};

export const SuccessState: Story = {
  args: {
    label: 'Username',
    value: 'validUser123',
    status: 'success',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot type here',
    disabled: true,
  },
};
