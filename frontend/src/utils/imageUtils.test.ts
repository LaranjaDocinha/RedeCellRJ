import { describe, it, expect, vi } from 'vitest';
import { removeBackground } from './imageUtils';

describe('ImageUtils', () => {
  it('should read image file and return data URL', async () => {
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    
    // Mocking console.log to avoid noise in tests
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const result = await removeBackground(file);
    
    expect(consoleSpy).toHaveBeenCalledWith('Removendo fundo da imagem:', 'test.png');
    expect(result).toContain('data:image/png;base64,');
    
    consoleSpy.mockRestore();
  });
});
