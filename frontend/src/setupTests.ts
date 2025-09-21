import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import { toHaveNoViolations } from 'jest-axe';

// Set a base URL for JSDOM to resolve relative URLs in fetch calls
if (typeof global.jsdom !== 'undefined') {
  global.jsdom.reconfigure({ url: 'http://localhost/' });
}

const ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserver);

// Mock getBBox for SVG elements, used by ApexCharts
if (typeof SVGElement !== 'undefined') {
  SVGElement.prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
}

expect.extend(toHaveNoViolations);
