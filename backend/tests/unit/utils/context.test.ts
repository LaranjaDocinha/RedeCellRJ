import { describe, it, expect, vi } from 'vitest';

vi.unmock('../../../src/utils/context.js');

import { context, getContext, getLogger } from '../../../src/utils/context.js';

describe('Context Utility', () => {
  it('should return undefined if no context set', () => {
    expect(getContext()).toBeUndefined();
    expect(getLogger()).toBeUndefined();
  });

  it('should store and retrieve context', () => {
    const mockCtx = { requestId: '123', logger: { info: () => {} } as any };
    context.run(mockCtx, () => {
      expect(getContext()).toEqual(mockCtx);
      expect(getLogger()).toBe(mockCtx.logger);
    });
  });
});
