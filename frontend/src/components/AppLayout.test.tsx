import { render, screen } from '../test-utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import AppLayout from './AppLayout';
import { TestProviders } from '../test-utils/TestProviders';
import React from 'react';

// Mock robusto para subcomponentes
vi.mock('./Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('./Topbar', () => ({ default: () => <div data-testid="topbar">Topbar</div> }));
vi.mock('./AIChatBot', () => ({ default: () => <div data-testid="chatbot">Chatbot</div> }));
vi.mock('./ui/WorkspaceBar', () => ({ default: () => <div data-testid="workspace-bar">WorkspaceBar</div> }));
vi.mock('./ui/SmartBreadcrumbs', () => ({ SmartBreadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div> }));
vi.mock('./ui/ScrollProgress', () => ({ ScrollProgress: () => <div /> }));
vi.mock('./ui/CursorSpotlight', () => ({ CursorSpotlight: () => <div /> }));
vi.mock('./GlobalSearch/GlobalSearch', () => ({ default: () => <div /> }));
vi.mock('./GuidedTour', () => ({ default: () => <div /> }));
vi.mock('./ui/CommandPalette', () => ({ CommandPalette: () => <div /> }));
vi.mock('./ui/NotificationDrawer', () => ({ NotificationDrawer: () => <div /> }));
vi.mock('./MoodCheckInModal', () => ({ default: () => <div /> }));
vi.mock('./OfflineIndicator', () => ({ default: () => <div /> }));
vi.mock('./ProductComparisonBar', () => ({ ProductComparisonBar: () => <div /> }));

describe('AppLayout Component', () => {
  it('should render core layout elements', () => {
    render(<AppLayout />, { wrapper: TestProviders });

    expect(screen.getByTestId('sidebar')).toBeDefined();
    expect(screen.getByTestId('topbar')).toBeDefined();
    expect(screen.getByTestId('workspace-bar')).toBeDefined();
  });
});