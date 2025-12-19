import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as addressService from '../../../src/services/addressService';
import * as dbModule from '../../../src/db/index';

// Mock getPool
const mockQuery = vi.fn();
const mockPool = {
  query: mockQuery,
};

vi.mock('../../../src/db/index', () => ({
  getPool: vi.fn(() => mockPool),
}));

describe('AddressService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAddress', () => {
    it('should insert address and return it', async () => {
      const mockAddress = { id: 1, street: 'Main St' };
      mockQuery.mockResolvedValue({ rows: [mockAddress] });

      const addressData = {
        address_line1: 'Main St',
        address_line2: 'Apt 1',
        city: 'City',
        state: 'State',
        zip_code: '12345',
        country: 'Country',
        is_default: true,
      };

      const result = await addressService.createAddress(1, addressData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO customer_addresses'),
        [1, ...Object.values(addressData)]
      );
      expect(result).toEqual(mockAddress);
    });
  });

  describe('updateAddress', () => {
    it('should update address and return it', async () => {
      const mockAddress = { id: 1, street: 'Updated St' };
      mockQuery.mockResolvedValue({ rows: [mockAddress] });

      const addressData = {
        address_line1: 'Updated St',
        address_line2: '',
        city: 'City',
        state: 'State',
        zip_code: '12345',
        country: 'Country',
        is_default: false,
      };

      const result = await addressService.updateAddress(1, addressData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE customer_addresses SET'),
        [...Object.values(addressData), 1]
      );
      expect(result).toEqual(mockAddress);
    });
  });

  describe('deleteAddress', () => {
    it('should delete address and return deleted row', async () => {
      const mockAddress = { id: 1 };
      mockQuery.mockResolvedValue({ rows: [mockAddress] });

      const result = await addressService.deleteAddress(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM customer_addresses'),
        [1]
      );
      expect(result).toEqual(mockAddress);
    });
  });

  describe('getAddressesByCustomerId', () => {
    it('should return addresses for customer', async () => {
      const mockAddresses = [{ id: 1 }, { id: 2 }];
      mockQuery.mockResolvedValue({ rows: mockAddresses });

      const result = await addressService.getAddressesByCustomerId(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM customer_addresses'),
        [1]
      );
      expect(result).toEqual(mockAddresses);
    });
  });
});
