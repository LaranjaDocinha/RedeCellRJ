import type { Meta, StoryObj } from '@storybook/react';
import Checkbox from '../components/Checkbox';
import { useState } from 'react';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

const CheckboxWrapper = (args: any) => {
  const [checked, setChecked] = useState(args.checked || false);
  return (
    <Checkbox
      {...args}
      checked={checked}
      onChange={(e) => {
        setChecked(e.target.checked);
        args.onChange?.(e);
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <CheckboxWrapper {...args} />,
  args: {
    label: 'Accept terms and conditions',
  },
};

export const Checked: Story = {
  render: (args) => <CheckboxWrapper {...args} />,
  args: {
    label: 'Already checked',
    checked: true,
  },
};

export const WithError: Story = {
  render: (args) => <CheckboxWrapper {...args} />,
  args: {
    label: 'Required field',
    error: 'You must agree to proceed',
  },
};

export const Disabled: Story = {
  render: (args) => <CheckboxWrapper {...args} />,
  args: {
    label: 'Disabled option',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  render: (args) => <CheckboxWrapper {...args} />,
  args: {
    label: 'Disabled checked',
    disabled: true,
    checked: true,
  },
};
