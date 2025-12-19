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

  // A function that can be called like `motion(Component)`
  const motion = (Component) => {
    const MockComponent = React.forwardRef(({ children, ...props }, ref) => {
      const filteredProps = { ...props };
      motionProps.forEach(key => delete filteredProps[key]);
      return <Component ref={ref} {...filteredProps}>{children}</Component>;
    });
    MockComponent.displayName = `motion(${Component.displayName || Component.name || 'Component'})`;
    return MockComponent;
  };

  // Attach the proxy for `motion.div`, `motion.p`, etc.
  const motionProxy = new Proxy(motion, {
    get: (target, prop) => {
      if (prop === 'prototype') return target.prototype; // Preserve prototype
      
      const MockComponent = React.forwardRef(({ children, ...props }, ref) => {
        const filteredProps = { ...props };
        motionProps.forEach(key => delete filteredProps[key]);
        return React.createElement(prop, { ...filteredProps, ref }, children);
      });
      MockComponent.displayName = `motion.${String(prop)}`;
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

// // Mock CartContext globally
// vi.mock('../contexts/CartContext', () => ({
//   useCart: () => ({
//     addToCart: vi.fn(),
//   }),
//   CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
// }));

// Mock useSound globally
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
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Mock getBBox for SVG elements, used by ApexCharts
if (typeof SVGElement !== 'undefined') {
  SVGElement.prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    toJSON: () => {},
  });
}

// Mock fetch
// Mock do axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url.includes('/api/diagnostics/root')) {
        return Promise.resolve({
          data: [{
            id: 'root1',
            question_text: 'Root Question',
            is_solution: false,
            parent_node_id: null,
          }],
        });
      }
      if (url.includes('/api/diagnostics/root1/options')) {
        return Promise.resolve({
          data: [{
            id: 'opt1',
            diagnostic_node_id: 'root1',
            option_text: 'Option 1',
            next_node_id: 'node2',
          }],
        });
      }
      if (url.includes('/api/diagnostics/node2')) {
        return Promise.resolve({
          data: {
            id: 'node2',
            question_text: 'Next Question',
            is_solution: false,
            parent_node_id: 'root1',
          },
        });
      }
      // Fallback para outras chamadas axios
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// Mock do uuid
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-v4',
}));

// Mock do FeedbackForm
vi.mock('../components/Diagnostics/FeedbackForm', () => ({
  default: () => <div data-testid="FeedbackForm-mock" />,
}));


// Mock fetch
global.fetch = vi.fn((url) => {
  if (url.toString().includes('/api/branding')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        logoUrl: '/test-logo.png',
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        fontFamily: 'Arial',
        faviconUrl: '/test-favicon.ico',
        appName: 'Test App',
      }),
    });
  }
  // Mock for user data, which might be fetched by some components
  if (url.toString().includes('/users')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'Test User 1' }, { id: 2, name: 'Test User 2' }]),
    });
  }
  console.warn(`Unhandled fetch mock for URL: ${url}`);
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

// Mock do i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  I18nextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock do @mui/icons-material para retornar um componente SVG genérico
vi.mock('@mui/icons-material', async (importOriginal) => {
  const actual = await importOriginal();
  return new Proxy(actual as object, {
    get: (target, property) => {
      if (property === '__esModule') {
        return true;
      }
      if (typeof property === 'string' && property.endsWith('Icon')) {
        return React.forwardRef((props, ref) => (
          <svg {...props} ref={ref} data-testid={`${property}-mock`} />
        ));
      }
      return target[property as keyof typeof target];
    },
  });
});

// expect.extend(toHaveNoViolations);