import React from 'react';
// import TemplateComponent from './TemplateComponent'; // Uncomment and import your component

export default {
  title: 'Common/TemplateComponent',
  component: () => <div>Template Component</div>, // Replace with your actual component
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define your component's props here for Storybook controls
    // exampleProp: {
    //   control: 'text',
    //   description: 'A description for exampleProp',
    // },
  },
};

// Define your stories
export const Default = {
  args: {
    // Default values for your component's props
    // exampleProp: 'Default Value',
  },
};

export const AnotherState = {
  args: {
    // Different values for your component's props to show another state
    // exampleProp: 'Another Value',
  },
};
