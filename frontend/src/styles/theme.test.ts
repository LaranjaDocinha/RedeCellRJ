import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lightTheme, darkTheme } from './theme';

describe('Theme System', () => {
  it('should have correct palette mode for light theme', () => {
    expect(lightTheme.palette.mode).toBe('light');
    expect(lightTheme.palette.primary.main).toBeDefined();
  });

  it('should have correct palette mode for dark theme', () => {
    expect(darkTheme.palette.mode).toBe('dark');
    expect(darkTheme.palette.background.default).toBe('#121212');
  });

  it('should include custom design tokens in the themes', () => {
    expect(lightTheme.colors).toBeDefined();
    expect(lightTheme.borderRadius).toBeDefined();
    expect(lightTheme.customShadows).toBeDefined();
  });

  it('should have spacing configured correctly', () => {
    // MUI theme spacing is a function by default
    expect(typeof lightTheme.spacing).toBe('function');
    expect(lightTheme.spacing(2)).toBe('16px');
  });
});
