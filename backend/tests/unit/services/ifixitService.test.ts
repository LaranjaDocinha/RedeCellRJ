import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchGuides, getGuideDetails } from '../../../src/services/ifixitService';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('iFixitService', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpa todas as chamadas e mocks
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restaura tudo
  });

  describe('searchGuides', () => {
    it('should return search results', async () => {
      const mockResults = { results: [{ id: 1, title: 'Guide 1' }] };
      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockResults });

      const result = await searchGuides('iPhone');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/search/iPhone'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResults.results);
    });

    it('should return empty array on error', async () => {
      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network Error'));

      const result = await searchGuides('iPhone');
      expect(result).toEqual([]);
    });
  });

  describe('getGuideDetails', () => {
    it('should return guide details', async () => {
      const mockDetails = { id: 1, title: 'Guide 1 Details' };
      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockDetails });

      const result = await getGuideDetails(1);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/guides/1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockDetails);
    });

    it('should throw error if details fetch fails', async () => {
      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network Error'));

      await expect(getGuideDetails(1)).rejects.toThrow('Failed to fetch guide details from iFixit for ID 1');
    });
  });
});
