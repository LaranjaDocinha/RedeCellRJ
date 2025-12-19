import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown } from '../components/Dropdown';
import { Button } from '../components/Button';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';

const meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button label="Abrir Dropdown" />,
    children: (
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary="Perfil" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary="Configurações" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    ),
  },
};