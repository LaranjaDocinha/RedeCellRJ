import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Card, { CardHeader, CardContent, CardFooter, CardActions } from '../components/Card';
import { Button } from '../components/Button';
import { Typography } from '@mui/material';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    elevation: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    interactive: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} style={{ maxWidth: 400 }}>
      <CardHeader>
        <Typography variant="h6">Card Title</Typography>
      </CardHeader>
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          This is a default card with header, content, and footer. It uses Material UI Typography for text elements.
        </Typography>
      </CardContent>
      <CardFooter>
        <Typography variant="caption">Last updated 5 mins ago</Typography>
      </CardFooter>
    </Card>
  ),
};

export const Interactive: Story = {
  args: {
    interactive: true,
    elevation: 'md',
  },
  render: (args) => (
    <Card {...args} style={{ maxWidth: 400 }}>
      <CardHeader>
        <Typography variant="h6">Interactive Card</Typography>
      </CardHeader>
      <CardContent>
        <Typography variant="body2">
          Hover over this card to see the interaction effect. Useful for clickable items like product lists or dashboard shortcuts.
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="text" size="small">Learn More</Button>
        <Button variant="contained" size="small">Action</Button>
      </CardActions>
    </Card>
  ),
};

export const HighElevation: Story = {
  args: {
    elevation: 'xl',
  },
  render: (args) => (
    <Card {...args} style={{ maxWidth: 400 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Elevated Content</Typography>
        <Typography variant="body1">
          This card has a very high elevation, making it stand out significantly from the background.
        </Typography>
      </CardContent>
    </Card>
  ),
};

export const NoElevation: Story = {
  args: {
    elevation: 'none',
  },
  render: (args) => (
    <Card {...args} style={{ maxWidth: 400, border: '1px solid #ddd' }}>
      <CardContent>
        <Typography variant="h6">Flat Card</Typography>
        <Typography variant="body2">
          A card with no elevation, often used with a border for a cleaner, modern look in dense UIs.
        </Typography>
      </CardContent>
    </Card>
  ),
};
