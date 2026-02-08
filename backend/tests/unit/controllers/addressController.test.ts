import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import * as addressController from '../../../src/controllers/addressController';
import * as addressService from '../../../src/services/addressService';

// Mock do addressService
vi.mock('../../../src/services/addressService', () => ({
  createAddress: vi.fn(),
  updateAddress: vi.fn(),
  deleteAddress: vi.fn(),
  getAddressesByCustomerId: vi.fn(),
}));

describe('AddressController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: vi.fn(),
      status: vi.fn(() => mockResponse),
    };
  });

  describe('createAddress', () => {
    it('should call createAddress service and return 201 with created address', async () => {
      const mockAddress = { id: 1, street: 'Main St' };
      (addressService.createAddress as any).mockResolvedValue(mockAddress);

      mockRequest.params = { customerId: '1' };
      mockRequest.body = { street: 'Main St' };

      await addressController.createAddress(mockRequest as Request, mockResponse as Response);

      expect(addressService.createAddress).toHaveBeenCalledWith(1, mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAddress);
    });

    it('should return 500 if createAddress service throws an error', async () => {
      const errorMessage = 'Failed to create address';
      (addressService.createAddress as any).mockRejectedValue(new Error(errorMessage));

      mockRequest.params = { customerId: '1' };

      await addressController.createAddress(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('updateAddress', () => {
    it('should call updateAddress service and return 200 with updated address', async () => {
      const mockAddress = { id: 1, street: 'Updated St' };
      (addressService.updateAddress as any).mockResolvedValue(mockAddress);

      mockRequest.params = { id: '1' };
      mockRequest.body = { street: 'Updated St' };

      await addressController.updateAddress(mockRequest as Request, mockResponse as Response);

      expect(addressService.updateAddress).toHaveBeenCalledWith(1, mockRequest.body);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAddress);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 404 if address not found', async () => {
      (addressService.updateAddress as any).mockResolvedValue(null);

      mockRequest.params = { id: '999' };

      await addressController.updateAddress(mockRequest as Request, mockResponse as Response);

      expect(addressService.updateAddress).toHaveBeenCalledWith(999, undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Address not found' });
    });

    it('should return 500 if updateAddress service throws an error', async () => {
      const errorMessage = 'Failed to update address';
      (addressService.updateAddress as any).mockRejectedValue(new Error(errorMessage));

      mockRequest.params = { id: '1' };

      await addressController.updateAddress(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('deleteAddress', () => {
    it('should call deleteAddress service and return 200 with success message', async () => {
      const mockAddress = { id: 1 };
      (addressService.deleteAddress as any).mockResolvedValue(mockAddress);

      mockRequest.params = { id: '1' };

      await addressController.deleteAddress(mockRequest as Request, mockResponse as Response);

      expect(addressService.deleteAddress).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Address deleted successfully' });
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 404 if address not found', async () => {
      (addressService.deleteAddress as any).mockResolvedValue(null);

      mockRequest.params = { id: '999' };

      await addressController.deleteAddress(mockRequest as Request, mockResponse as Response);

      expect(addressService.deleteAddress).toHaveBeenCalledWith(999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Address not found' });
    });

    it('should return 500 if deleteAddress service throws an error', async () => {
      const errorMessage = 'Failed to delete address';
      (addressService.deleteAddress as any).mockRejectedValue(new Error(errorMessage));

      mockRequest.params = { id: '1' };

      await addressController.deleteAddress(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('getAddressesByCustomerId', () => {
    it('should call getAddressesByCustomerId service and return 200 with addresses', async () => {
      const mockAddresses = [{ id: 1, street: 'Main St' }];
      (addressService.getAddressesByCustomerId as any).mockResolvedValue(mockAddresses);

      mockRequest.params = { customerId: '1' };

      await addressController.getAddressesByCustomerId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(addressService.getAddressesByCustomerId).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAddresses);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 500 if getAddressesByCustomerId service throws an error', async () => {
      const errorMessage = 'Failed to get addresses';
      (addressService.getAddressesByCustomerId as any).mockRejectedValue(new Error(errorMessage));

      mockRequest.params = { customerId: '1' };

      await addressController.getAddressesByCustomerId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });
});
