// src/test/setup.js
import { expect, afterEach, vi } from 'vitest';
import { cleanup, configure } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Étendre expect avec les matchers jest-dom
expect.extend(matchers);

// Cleanup après chaque test
afterEach(() => {
  cleanup();
});

configure({
  testIdAttribute: 'data-testid',
});

const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('ReactDOMTestUtils.act')) return;
  originalError(...args);
};

// Mock global pour ResizeObserver
globalThis.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock pour matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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
