import type { Meta, StoryObj } from '@storybook/react';
import Field from '../components/Field';
import { useForm, FormProvider } from 'react-hook-form';
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    error: '#B00020',
    onSurface: '#000000',
    surface: '#FFFFFF',
    primary: '#6200EE',
  },
  typography: {
    body2: { fontSize: '14px' },
    caption: { fontSize: '12px' },
  },
};

const meta: Meta<typeof Field> = {
  title: 'Components/Forms/Field',
  component: Field,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const methods = useForm();
      return (
        <ThemeProvider theme={theme}>
          <FormProvider {...methods}>
            <form style={{ padding: 20 }}>
              <Story />
            </form>
          </FormProvider>
        </ThemeProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Field>;

export const Text: Story = {
  args: {
    name: 'username',
    label: 'Username',
  },
};

export const Password: Story = {
  args: {
    name: 'password',
    label: 'Password',
    type: 'password',
  },
};
