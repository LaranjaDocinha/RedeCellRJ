import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils/TestWrapper';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DiagnosticWizard from './DiagnosticWizard';
import axios from 'axios';
import { DiagnosticNode, DiagnosticNodeOption } from '../../types/diagnostic';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

// Mock useNotification
vi.mock('../../contexts/NotificationContext', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNotification: () => ({
            addNotification: vi.fn(),
            addToast: vi.fn(),
        }),
    };
});

describe('DiagnosticWizard', () => {
  const mockRootNodes: DiagnosticNode[] = [
    { id: 'root1', question_text: 'Root Question 1', is_solution: false, solution_details: null, parent_node_id: null },
  ];
  const mockChildNodes: DiagnosticNode[] = [
    { id: 'child1', question_text: 'Child Question 1', is_solution: false, solution_details: null, parent_node_id: 'root1' },
  ];
  const mockSolutionNode: DiagnosticNode = {
    id: 'solution1', question_text: 'Solution', is_solution: true, solution_details: 'Here is the solution.', parent_node_id: 'child1',
  };
  const mockOptions: DiagnosticNodeOption[] = [
    { id: 'opt1', diagnostic_node_id: 'root1', option_text: 'Option 1', next_node_id: 'child1' },
  ];
  const mockSolutionOptions: DiagnosticNodeOption[] = [
    { id: 'opt2', diagnostic_node_id: 'child1', option_text: 'Go to Solution', next_node_id: 'solution1' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/diagnostics/root')) {
        return Promise.resolve({ data: mockRootNodes });
      }
      if (url.includes(`/api/diagnostics/${mockRootNodes[0].id}/options`)) {
        return Promise.resolve({ data: mockOptions });
      }
      if (url.includes(`/api/diagnostics/${mockOptions[0].next_node_id}`)) {
        return Promise.resolve({ data: mockChildNodes[0] });
      }
      if (url.includes(`/api/diagnostics/${mockChildNodes[0].id}/options`)) {
        return Promise.resolve({ data: mockSolutionOptions });
      }
      if (url.includes(`/api/diagnostics/${mockSolutionOptions[0].next_node_id}`)) {
        return Promise.resolve({ data: mockSolutionNode });
      }
      return Promise.reject(new Error('not found'));
    });
    mockedAxios.post.mockResolvedValue({ data: {} });
  });

  it('should render loading state initially', () => {
    mockedAxios.get.mockReturnValueOnce(new Promise(() => {})); // Never resolve to keep loading
    render(<DiagnosticWizard />);
    expect(screen.getByText('Loading diagnostic wizard...')).toBeInTheDocument();
  });

  it('should render error state if fetching root nodes fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));
    render(<DiagnosticWizard />);
    await waitFor(() => expect(screen.getByText('Error loading diagnostic wizard.')).toBeInTheDocument());
  });

  it('should render empty state if no root nodes are configured', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    render(<DiagnosticWizard />);
    await waitFor(() => expect(screen.getByText('Nenhum nó de diagnóstico configurado.')).toBeInTheDocument());
  });

  it('should display the first root node and its options', async () => {
    render(<DiagnosticWizard />);
    await waitFor(() => expect(screen.getByText(mockRootNodes[0].question_text)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: mockOptions[0].option_text })).toBeInTheDocument();
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/diagnostics/history', expect.any(Object)); // Initial history record
  });

  it('should navigate to the next node when an option is clicked', async () => {
    render(<DiagnosticWizard />);
    await waitFor(() => expect(screen.getByText(mockRootNodes[0].question_text)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: mockOptions[0].option_text }));

    await waitFor(() => expect(screen.getByText(mockChildNodes[0].question_text)).toBeInTheDocument());
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/diagnostics/history', expect.objectContaining({ nodeId: mockRootNodes[0].id, selectedOptionId: mockOptions[0].id }));
  });

  it('should display solution details when a solution node is reached', async () => {
    render(<DiagnosticWizard />);
    await waitFor(() => expect(screen.getByText(mockRootNodes[0].question_text)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: mockOptions[0].option_text }));
    await waitFor(() => expect(screen.getByText(mockChildNodes[0].question_text)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: mockSolutionOptions[0].option_text }));
    await waitFor(() => expect(screen.getByText(mockSolutionNode.solution_details)).toBeInTheDocument());
  });

  it('should go back to the previous node when "Voltar" button is clicked', async () => {
    render(<DiagnosticWizard />);
    await waitFor(() => expect(screen.getByText(mockRootNodes[0].question_text)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: mockOptions[0].option_text }));
    await waitFor(() => expect(screen.getByText(mockChildNodes[0].question_text)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    await waitFor(() => expect(screen.getByText(mockRootNodes[0].question_text)).toBeInTheDocument());
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/diagnostics/history', expect.objectContaining({ nodeId: mockRootNodes[0].id, action: 'go_back' }));
  });

  it('should restart the diagnostic when "Reiniciar Diagnóstico" button is clicked', async () => {
    render(<DiagnosticWizard />);
    await waitFor(() => expect(screen.getByText(mockRootNodes[0].question_text)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: mockOptions[0].option_text }));
    await waitFor(() => expect(screen.getByText(mockChildNodes[0].question_text)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar Diagnóstico' }));
    await waitFor(() => expect(screen.getByText(mockRootNodes[0].question_text)).toBeInTheDocument());
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/diagnostics/history', expect.objectContaining({ action: 'restart_diagnostic' }));
  });

  it('should navigate back to a specific node in history when breadcrumb link is clicked', async () => {
    render(<DiagnosticWizard />);
    await waitFor(() => expect(screen.getByText(mockRootNodes[0].question_text)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: mockOptions[0].option_text }));
    await waitFor(() => expect(screen.getByText(mockChildNodes[0].question_text)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('link', { name: mockRootNodes[0].question_text }));
    await waitFor(() => expect(screen.getByText(mockRootNodes[0].question_text)).toBeInTheDocument());
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/diagnostics/history', expect.objectContaining({ nodeId: mockRootNodes[0].id, action: 'go_back_to_node' }));
  });
});
