import React from 'react';
import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

import 'jest-axe/extend-expect';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal();
  const motionProps = [
    'initial', 'animate', 'exit', 'transition', 'whileHover',
    'whileTap', 'whileFocus', 'layout', 'variants'
  ];

  const motion = (Component) => {
    const MockComponent = React.forwardRef(({ children, ...props }, ref) => {
      const filteredProps = { ...props };
      motionProps.forEach(key => delete filteredProps[key]);
      return <Component ref={ref} {...filteredProps}>{children}</Component>;
    });
    return MockComponent;
  };

  const motionProxy = new Proxy(motion, {
    get: (target, prop) => {
      if (prop === 'prototype') return target.prototype;
      const MockComponent = React.forwardRef(({ children, ...props }, ref) => {
        const filteredProps = { ...props };
        motionProps.forEach(key => delete filteredProps[key]);
        return React.createElement(prop, { ...filteredProps, ref }, children);
      });
      return MockComponent;
    },
  });

  return {
    ...actual,
    motion: motionProxy,
    AnimatePresence: ({ children }) => <>{children}</>,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
    useScroll: () => ({
      scrollYProgress: {
        get: () => 0,
        on: (event, listener) => { if (event === 'change') listener(0); return () => {}; },
        onChange: (listener) => { listener(0); return () => {}; },
      },
    }),
    useTransform: (value, from, to) => to[0],
    useSpring: (value) => value,
  };
});

vi.mock('./contexts/SoundContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useSound: () => ({
      playSound: vi.fn(),
      isSoundEnabled: true,
      toggleSound: vi.fn(),
    }),
    SoundProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), 
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
vi.stubGlobal('ResizeObserver', vi.fn(() => ({ observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() })));

// Mock do uuid
vi.mock('uuid', () => ({ v4: () => 'mock-uuid-v4' }));

// Mock do i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: { changeLanguage: () => Promise.resolve() },
  }),
  I18nextProvider: ({ children }: any) => <>{children}</>,
}));

// Mocks de Contexto Globais
vi.mock('./contexts/SocketContext', () => ({
  useSocket: () => ({ socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() } }),
  SocketProvider: ({ children }: any) => <>{children}</>,
}));

// Mock agressivo para @mui/icons-material
vi.mock('@mui/icons-material', async () => {
  const React = await import('react');
  const Icon = React.default.forwardRef((props: any, ref: any) => React.default.createElement('span', { ...props, ref }));
  
  return new Proxy({} as any, {
    get: (target, prop) => {
      if (prop === '__esModule') return true;
      return Icon;
    },
    has: () => true
  });
});

// Mock do axios globalmente para evitar falhas de rede por padrão
vi.mock('axios', () => {
    const mockAxios = {
        get: vi.fn(() => Promise.resolve({ data: {} })),
        post: vi.fn(() => Promise.resolve({ data: {} })),
        put: vi.fn(() => Promise.resolve({ data: {} })),
        patch: vi.fn(() => Promise.resolve({ data: {} })),
        delete: vi.fn(() => Promise.resolve({ data: {} })),
        interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() },
        },
        create: vi.fn(() => mockAxios),
        defaults: { headers: { common: {} } },
    };
    return { default: mockAxios };
});

vi.mock('axios-retry', () => ({ default: vi.fn() }));
