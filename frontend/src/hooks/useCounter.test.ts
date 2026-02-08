import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter Hook', () => {
  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('should increment correctly', () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => { result.current.increment(); });
    expect(result.current.count).toBe(1);
  });

  it('should decrement correctly', () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => { result.current.decrement(); });
    expect(result.current.count).toBe(4);
  });

  it('should reset correctly', () => {
    const { result } = renderHook(() => useCounter(100));
    act(() => { 
        result.current.increment(); 
        result.current.reset();
    });
    expect(result.current.count).toBe(100);
  });
});
