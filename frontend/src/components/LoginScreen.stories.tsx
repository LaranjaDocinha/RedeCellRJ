import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { LoginScreen } from './LoginScreen';

const meta = {
  title: 'Pages/LoginScreen',
  component: LoginScreen,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Define o tema da tela de login.',
    },
  },
} satisfies Meta<typeof LoginScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Bem-vindo de Volta!',
    subtitle: 'Acesse sua conta para continuar.',
    theme: 'light',
  },
};

export const DarkTheme: Story = {
  args: {
    title: 'Bem-vindo de Volta!',
    subtitle: 'Acesse sua conta para continuar.',
    theme: 'dark',
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Olá, Usuário!',
    subtitle: 'Entre com suas credenciais.',
    theme: 'light',
  },
};
