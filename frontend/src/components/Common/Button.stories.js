import React from 'react';

import Button from './Button';

// Importa os estilos globais para que os botões apareçam corretamente
import '../../index.scss';

export default {
  title: 'Design System/Common/Button',
  component: Button,
  argTypes: {
    children: { control: 'text' },
    color: {
      control: {
        type: 'select',
        options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'],
      },
    },
    icon: { control: 'text' },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  color: 'primary',
  children: 'Botão Primário',
};

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'secondary',
  children: 'Botão Secundário',
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  color: 'success',
  children: 'Adicionar',
  icon: 'bx bx-plus-circle',
};

export const Disabled = Template.bind({});
Disabled.args = {
  color: 'primary',
  children: 'Botão Desabilitado',
  disabled: true,
};

export const IconButton = Template.bind({});
IconButton.args = {
  color: 'danger',
  icon: 'bx bx-trash',
  children: '', // Botões de ícone geralmente não têm texto
};
