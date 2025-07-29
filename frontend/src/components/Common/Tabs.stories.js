import React from 'react';
import { Card, CardBody } from 'reactstrap';

import Tabs from './Tabs';

export default {
  title: 'Common/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tabs: {
      description: 'Array of tab objects, each with a title and content.',
      control: 'object',
    },
  },
};

const Template = (args) => (
  <Card style={{ width: '600px' }}>
    <CardBody>
      <Tabs {...args} />
    </CardBody>
  </Card>
);

export const Default = Template.bind({});
Default.args = {
  tabs: [
    {
      title: 'Tab 1',
      content: (
        <div>
          <h4>Conteúdo da Aba 1</h4>
          <p>Este é o conteúdo da primeira aba.</p>
        </div>
      ),
    },
    {
      title: 'Tab 2',
      content: (
        <div>
          <h4>Conteúdo da Aba 2</h4>
          <p>Este é o conteúdo da segunda aba, com mais informações.</p>
        </div>
      ),
    },
    {
      title: 'Tab 3',
      content: (
        <div>
          <h4>Conteúdo da Aba 3</h4>
          <p>Aqui está o conteúdo da terceira aba.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      ),
    },
  ],
};

export const SingleTab = Template.bind({});
SingleTab.args = {
  tabs: [
    {
      title: 'Aba Única',
      content: (
        <div>
          <h4>Conteúdo da Aba Única</h4>
          <p>Esta é uma aba solitária.</p>
        </div>
      ),
    },
  ],
};

export const EmptyTabs = Template.bind({});
EmptyTabs.args = {
  tabs: [],
};
