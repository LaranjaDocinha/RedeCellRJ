
import React, { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';

export default {
  title: 'Components/Common/ToggleSwitch',
  component: ToggleSwitch,
};

const Template = (args) => {
  const [isChecked, setIsChecked] = useState(args.checked);

  const handleChange = (e) => {
    setIsChecked(e.target.checked);
    args.onChange(e);
  };

  return <ToggleSwitch {...args} checked={isChecked} onChange={handleChange} />;
};

export const Default = Template.bind({});
Default.args = {
  name: 'default-switch',
  label: 'Default Toggle Switch',
  checked: false,
};

export const Checked = Template.bind({});
Checked.args = {
  name: 'checked-switch',
  label: 'Checked Toggle Switch',
  checked: true,
};
