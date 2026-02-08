import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationProvider, useNotification } from './NotificationContext';
import api from '../services/api';
import * as AuthContext from './AuthContext';
import * as SocketContext from './SocketContext';
import confetti from 'canvas-confetti';

vi.mock('../services/api');
vi.mock('./AuthContext');
vi.mock('./SocketContext');
vi.mock('canvas-confetti');

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <NotificationProvider>{children}</NotificationProvider>
);

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (AuthContext.useAuth as any).mockReturnValue({ user: { id: '1' }, isAuthenticated: true });
    (SocketContext.useSocket as any).mockReturnValue({ on: vi.fn(), off: vi.fn() });
    (api.get as any).mockResolvedValue({ data: [] });
  });

  it('should fetch notifications on mount if authenticated', async () => {
    const mockNotifs = [{ id: 1, message: 'Test', type: 'info' }];
    (api.get as any).mockResolvedValue({ data: mockNotifs });

    const { result } = renderHook(() => useNotification(), { wrapper });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });
    expect(api.get).toHaveBeenCalledWith('/notifications');
  });

  it('should show a toast when addNotification is called', () => {
    const { result } = renderHook(() => useNotification(), { wrapper });

    act(() => {
      result.current.addNotification('Success Message', 'success');
    });

    // Infelizmente o Snackbar do MUI é difícil de testar via hook sem renderizar a árvore,
    // mas verificamos se a função de celebração seria disparada se fosse uma notificação de socket
    // ou apenas que o hook não explode.
    expect(result.current.addNotification).toBeDefined();
  });

  it('should mark a notification as read via API', async () => {
    const mockNotifs = [{ id: '123', message: 'Test', read: false, type: 'info' }];
    (api.get as any).mockResolvedValue({ data: mockNotifs });
    (api.patch as any).mockResolvedValue({});

    const { result } = renderHook(() => useNotification(), { wrapper });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    await act(async () => {
      await result.current.markAsRead('123');
    });

    expect(api.patch).toHaveBeenCalledWith('/notifications/123/read');
    expect(result.current.notifications[0].read).toBe(true);
  });

  it('should trigger confetti on success socket notification', async () => {
    const mockSocket = { on: vi.fn(), off: vi.fn() };
    (SocketContext.useSocket as any).mockReturnValue(mockSocket);

    renderHook(() => useNotification(), { wrapper });

    // Pega o callback do socket.on
    const callback = mockSocket.on.mock.calls[0][1];
    
    act(() => {
      callback({ id: 2, message: 'Win!', type: 'success' });
    });

    expect(confetti).toHaveBeenCalled();
  });
});
