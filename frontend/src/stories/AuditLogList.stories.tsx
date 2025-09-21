import type { Meta, StoryObj } from '@storybook/react';
import { AuditLogList } from '../components/AuditLogList';

const meta: Meta<typeof AuditLogList> = {
  title: 'Admin/AuditLogList',
  component: AuditLogList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    logs: {
      control: 'object',
      description: 'Array of audit log entries',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AuditLogList>;

export const Default: Story = {
  args: {
    logs: [
      { id: 1, user_email: 'admin@example.com', action: 'CREATE', entity_type: 'Product', entity_id: 101, timestamp: '2023-01-01T10:00:00Z', details: { name: 'New Phone' } },
      { id: 2, user_email: 'manager@example.com', action: 'UPDATE', entity_type: 'Customer', entity_id: 201, timestamp: '2023-01-01T10:05:00Z', details: { oldEmail: 'a@b.com', newEmail: 'x@y.com' } },
      { id: 3, user_email: 'admin@example.com', action: 'DELETE', entity_type: 'User', entity_id: 301, timestamp: '2023-01-01T10:10:00Z', details: { userId: 301 } },
      { id: 4, user_email: null, action: 'LOGIN_ATTEMPT', entity_type: null, entity_id: null, timestamp: '2023-01-01T10:15:00Z', details: { ip: '192.168.1.1', status: 'failed' } },
    ],
  },
};

export const Empty: Story = {
  args: {
    logs: [],
  },
};
