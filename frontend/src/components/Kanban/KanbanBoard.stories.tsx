
import type { Meta, StoryObj } from '@storybook/react';
import KanbanBoard from './KanbanBoard';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { SocketProvider } from '../../contexts/SocketContext'; // Adicione esta linha

const meta: Meta<typeof KanbanBoard> = {
  title: 'Components/Kanban/KanbanBoard',
  component: KanbanBoard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
          ### Kanban Board

          O componente KanbanBoard é o coração da funcionalidade de quadros kanban.
          Ele é responsável por renderizar as colunas e os cartões, gerenciar o estado
          de arrastar e soltar (drag-and-drop) e orquestrar as chamadas de API para
          buscar e atualizar os dados do quadro.

          **Nota de Arquitetura:**
          Atualmente, este componente busca seus próprios dados. Em uma futura refatoração,
          a lógica de busca e manipulação de dados poderia ser extraída para um componente
          "container" ou um hook customizado, tornando o KanbanBoard um componente de
          apresentação mais puro e fácil de testar. As stories abaixo utilizam um
          'loader' para mockar as chamadas de API ('fetch').
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <NotificationProvider>
        <SocketProvider>
          <Story />
        </SocketProvider>
      </NotificationProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

// --- Mock Data ---
const mockUsers = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

const mockBoardData = [
  {
    id: 'col-1',
    title: 'A Fazer',
    cards: [
      { id: 'card-1', title: 'Configurar ambiente de dev', description: 'Instalar todas as dependências.', column_id: 'col-1', position: 0 },
      { id: 'card-2', title: 'Criar componentes de UI', description: 'Botões, inputs, etc.', column_id: 'col-1', position: 1 },
    ],
  },
  {
    id: 'col-2',
    title: 'Em Progresso',
    cards: [
      { id: 'card-3', title: 'Desenvolver a API', description: 'Endpoints de autenticação.', column_id: 'col-2', position: 0, assignee_id: 1, due_date: '2025-12-01' },
    ],
  },
  {
    id: 'col-3',
    title: 'Concluído',
    cards: [
      { id: 'card-4', title: 'Definir arquitetura', description: 'Desenhar o diagrama do sistema.', column_id: 'col-3', position: 0, assignee_id: 2 },
    ],
  },
];

const mockApi = (data: any) => {
  window.fetch = async (url: RequestInfo | URL): Promise<Response> => {
    const urlString = url.toString();
    console.log(`[Storybook Mock] Fetching: ${urlString}`);

    if (urlString.includes('/api/users')) {
      return new Response(JSON.stringify(mockUsers), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (urlString.includes('getBoard') || urlString.includes('/api/kanban/board')) {
       return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mock para outras chamadas de API (create, move, etc.) para evitar erros
    return new Response(JSON.stringify({ success: true, id: `new-${Math.random()}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
};

// --- Stories ---

export const Default: Story = {
  name: 'Quadro Padrão',
  loaders: [
    async () => {
      mockApi(mockBoardData);
      return {};
    },
  ],
};

export const EmptyBoard: Story = {
  name: 'Quadro Vazio',
  loaders: [
    async () => {
      mockApi([]);
      return {};
    },
  ],
};

export const LoadingState: Story = {
  name: 'Carregando',
  loaders: [
    async () => {
      window.fetch = async () => {
        // Nunca resolve, mantendo o estado de loading
        return new Promise(() => {});
      };
      return {};
    },
  ],
};

export const ErrorState: Story = {
  name: 'Estado de Erro',
  loaders: [
    async () => {
      window.fetch = async () => {
        return new Response(JSON.stringify({ message: 'Falha ao carregar o quadro.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      };
      return {};
    },
  ],
};
