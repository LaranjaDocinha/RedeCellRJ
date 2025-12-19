import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { withFormFeedback } from '../../components/forms/withFormFeedback';
import { TextField, Button, Stack } from '@mui/material';

const FormTextField = withFormFeedback(TextField);

const FormExample: React.FC = () => {
    const [text, setText] = useState('');
    const [hasError, setHasError] = useState(false);

    const handleSubmit = () => {
        if (text.length < 5) {
            setHasError(true);
            setTimeout(() => setHasError(false), 500); // Reset error state for re-animation
        } else {
            alert('Success!');
        }
    }

    return (
        <Stack spacing={2} width={300}>
            <FormTextField 
                label="Your Name (min 5 chars)"
                variant="outlined"
                value={text}
                onChange={(e) => setText(e.target.value)}
                hasError={hasError}
                error={hasError} // Prop for MUI to show red border
                helperText={hasError ? "Input is too short!" : ""}
            />
            <Button onClick={handleSubmit} variant="contained">Submit</Button>
        </Stack>
    )
}

const meta = {
  title: 'Forms/Feedback Animation',
  component: FormExample,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof FormExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
