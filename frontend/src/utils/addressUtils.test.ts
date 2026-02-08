import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAddressByCep } from './addressUtils';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('AddressUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should clean CEP and fetch address correctly', async () => {
    const mockData = {
      data: {
        logradouro: 'Rua Teste',
        bairro: 'Bairro Teste',
        localidade: 'Cidade Teste',
        uf: 'RJ'
      }
    };
    mockedAxios.get.mockResolvedValue(mockData);

    const result = await fetchAddressByCep('20.000-000');

    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('20000000'));
    expect(result?.street).toBe('Rua Teste');
  });

  it('should return null for invalid CEP length', async () => {
    const result = await fetchAddressByCep('123');
    expect(result).toBeNull();
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('should return null if ViaCEP returns error', async () => {
    mockedAxios.get.mockResolvedValue({ data: { erro: true } });
    const result = await fetchAddressByCep('00000000');
    expect(result).toBeNull();
  });
});
