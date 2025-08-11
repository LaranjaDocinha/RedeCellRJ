import React, { useState } from 'react';
import { Button } from 'reactstrap';

import StandardModal from './StandardModal';

export default {
  title: 'Common/StandardModal',
  component: StandardModal,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    title: { control: 'text' },
    children: { control: 'text' },
    footer: { control: 'text' },
  },
};

const Template = (args) => {
  const [isOpen, setIsOpen] = useState(args.isOpen);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      <Button color='primary' onClick={toggle}>
        Abrir Modal
      </Button>
      <StandardModal {...args} isOpen={isOpen} toggle={toggle}>
        {args.children}
      </StandardModal>
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  isOpen: false,
  title: 'Título do Modal',
  children: 'Conteúdo do modal aqui. Pode ser qualquer elemento React.',
  footer: <Button color='secondary'>Fechar</Button>,
};

export const NoFooter = Template.bind({});
NoFooter.args = {
  isOpen: false,
  title: 'Modal Sem Rodapé',
  children: 'Este modal não possui um rodapé.',
  footer: null,
};

export const LongContent = Template.bind({});
LongContent.args = {
  isOpen: false,
  title: 'Modal com Conteúdo Longo',
  children: (
    <div style={{ height: '300px', overflowY: 'auto' }}>
      <p>Este é um exemplo de conteúdo longo para o modal.</p>
      <p>Você pode rolar para ver mais.</p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </div>
  ),
  footer: <Button color='secondary'>Fechar</Button>,
};
