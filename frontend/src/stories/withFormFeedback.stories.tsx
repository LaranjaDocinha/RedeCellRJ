import type { Meta, StoryObj } from '@storybook/react';
import { withFormFeedback, WithFormFeedbackProps } from '../components/forms/withFormFeedback';
import { Button } from '@mui/material';

// Create a component to wrap
const SimpleButton = (props: any) => <Button variant="contained" color="error" {...props}>Click Me (Error)</Button>;
const WrappedButton = withFormFeedback(SimpleButton);

const meta: Meta<typeof WrappedButton> = {
  title: 'Components/HOCs/WithFormFeedback',
  component: WrappedButton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WrappedButton>;

export const NoError: Story = {
  args: {
    hasError: false,
  },
};

export const WithError: Story = {
  args: {
    hasError: true,
  },
};
