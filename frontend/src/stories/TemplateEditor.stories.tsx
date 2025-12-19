import type { Meta, StoryObj } from '@storybook/react';
import TemplateEditor from '../components/Templates/TemplateEditor';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { fn } from '@storybook/test';

const meta: Meta<typeof TemplateEditor> = {
  title: 'Components/Templates/TemplateEditor',
  component: TemplateEditor,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
        global.fetch = jest.fn((url, options: any) => {
            if (url === '/api/templates/preview') {
                const body = JSON.parse(options.body);
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ renderedContent: `<div>Preview: ${body.content}</div>` }),
                  });
            }
            return Promise.resolve({ ok: false });
        }) as any;
        return (
            <AuthProvider>
                <NotificationProvider>
                    <Story />
                </NotificationProvider>
            </AuthProvider>
        );
    }
  ],
  args: {
    onSave: fn(),
    onDelete: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof TemplateEditor>;

export const NewTemplate: Story = {
  args: {},
};

export const EditTemplate: Story = {
  args: {
    initialTemplate: {
        id: '1',
        name: 'Welcome Email',
        type: 'email',
        subject: 'Welcome!',
        content: 'Hello {{ customer_name }}, welcome to our store!',
    },
  },
};
