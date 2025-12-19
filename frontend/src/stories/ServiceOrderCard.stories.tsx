import React from 'react';
import { Story, Meta } from '@storybook/react';
import { ServiceOrderCard, ServiceOrderCardProps } from './ServiceOrderCard';

export default {
  title: 'Components/ServiceOrderCard',
  component: ServiceOrderCard,
} as Meta;

const Template: Story<ServiceOrderCardProps> = (args) => <ServiceOrderCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  order: {
    id: 1024,
    customerName: 'John Doe',
    productDescription: 'iPhone 14 Pro',
    status: 'Em Reparo',
    date: '2025-10-06',
  }
};
