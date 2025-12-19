import type { Meta, StoryObj } from '@storybook/react';
import Form from '../components/Form';
import Field from '../components/Field';
import { Button } from '../components/ui/Button'; // Assuming Button exists based on imports in other files
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

const meta: Meta<typeof Form> = {
  title: 'Components/Forms/FormWrapper',
  component: Form,
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
type Story = StoryObj<typeof Form>;

export const LoginExample: Story = {
  args: {
    children: (methods) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px' }}>
        <Field name="email" label="Email" type="email" />
        <Field name="password" label="Password" type="password" />
        <button type="submit" style={{ padding: '8px', background: '#6200EE', color: 'white', border: 'none' }}>Login</button>
      </div>
    ),
  },
};
