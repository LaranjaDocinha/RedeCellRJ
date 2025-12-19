import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import Sidebar from '../components/Sidebar';
import { lightTheme } from '../styles/theme';
import { GlobalStyle } from '../styles/global';
import React from 'react';

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controla a visibilidade da sidebar',
    },
    onClose: {
      action: 'closed',
      description: 'Função chamada ao fechar a sidebar',
    },
  },
  args: { onClose: fn() },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};

export const Compact: Story = {
  args: {
    isOpen: true,
  },
  decorators: [
    (Story) => {
      // Simula o estado compacto da sidebar se o componente suportar
      return <Story />;
    },
  ],
};
