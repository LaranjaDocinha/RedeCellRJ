import type { Meta, StoryObj } from '@storybook/react';
import { KanbanCardForm } from './KanbanCardForm';
import { BrowserRouter } from 'react-router-dom'; // Necessário para useLocation, NavLink, etc.
import { AuthProvider } from '../../contexts/AuthContext'; // Necessário para useAuth
import { NotificationProvider } from '../../contexts/NotificationContext'; // Necessário para useNotification

const meta: Meta<typeof KanbanCardForm> = {
  title: 'Kanban/KanbanCardForm',
  component: KanbanCardForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    initialData: {
      control: 'object',
      description: 'Initial data for the form (for editing)',
    },
    onSubmit: {
      action: 'submit form',
      description: 'Callback when form is submitted',
    },
    onCancel: {
      action: 'cancel form',
      description: 'Callback when form is cancelled',
    },
    availableAssignees: {
      control: 'object',
      description: 'Array of available assignees',
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Story />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof KanbanCardForm>;

export default meta;
type Story = StoryObj<typeof KanbanCardForm>;

const sampleAssignees = [
  { id: 1, name: 'João Silva' },
  { id: 2, name: 'Maria Souza' },
  { id: 3, name: 'Pedro Santos' },
];

export const CreateNewCard: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
    availableAssignees: sampleAssignees,
  },
};

export const EditExistingCard: Story = {
  args: {
    initialData: {
      id: '1',
      title: 'Resolver bug na tela de login',
      description: 'Investigar e corrigir o problema de autenticação.',
      due_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 16),
      assignee_id: 1,
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
    availableAssignees: sampleAssignees,
  },
};
