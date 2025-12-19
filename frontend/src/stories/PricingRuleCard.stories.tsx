import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import PricingRuleCard from '../components/PricingRuleCard';

export default {
  title: 'Smart Pricing/PricingRuleCard',
  component: PricingRuleCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    rule: { control: 'object' },
    onEdit: { action: 'editClicked' },
    onToggleStatus: { action: 'toggleStatusClicked' },
  },
} as Meta;

const Template: StoryFn<typeof PricingRuleCard> = (args) => <PricingRuleCard {...args} />;

export const LowTurnoverDiscount = Template.bind({});
LowTurnoverDiscount.args = {
  rule: {
    id: 1,
    name: 'Desconto por Encalhe',
    condition_type: 'low_turnover',
    condition_value: { days_without_sale: 60 },
    action_type: 'discount_percentage',
    action_value: 15,
    is_active: true,
    priority: 10,
  },
};

export const HighStockMarkup = Template.bind({});
HighStockMarkup.args = {
  rule: {
    id: 2,
    name: 'Margem Mínima por Volume',
    condition_type: 'high_stock',
    condition_value: { min_stock: 50 },
    action_type: 'markup_percentage',
    action_value: 25,
    is_active: true,
    priority: 5,
  },
};

export const InactiveRule = Template.bind({});
InactiveRule.args = {
  rule: {
    id: 3,
    name: 'Promoção de Inverno (Inativa)',
    condition_type: 'custom',
    condition_value: { season: 'winter' },
    action_type: 'discount_percentage',
    action_value: 10,
    is_active: false,
    priority: 0,
  },
};
