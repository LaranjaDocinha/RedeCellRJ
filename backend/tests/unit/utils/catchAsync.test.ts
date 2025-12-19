import { describe, it, expect, vi } from 'vitest';
import { catchAsync } from '../../../src/utils/catchAsync.js';

describe('catchAsync Utils', () => {
  it('should call next with error if async function rejects', async () => {
    const error = new Error('Async fail');
    const fn = vi.fn().mockRejectedValue(error);
    const req = {};
    const res = {};
    const next = vi.fn();

    const wrapped = catchAsync(fn);
    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should not call next if async function succeeds', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const req = {};
    const res = {};
    const next = vi.fn();

    const wrapped = catchAsync(fn);
    await wrapped(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});
