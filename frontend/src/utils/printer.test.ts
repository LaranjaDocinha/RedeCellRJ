import { describe, it, expect, vi, beforeEach } from 'vitest';
import { connectToPrinter, printReceipt } from './printer';

// Mock USBDevice and navigator.usb
const mockDevice = {
  open: vi.fn().mockResolvedValue(undefined),
  selectConfiguration: vi.fn().mockResolvedValue(undefined),
  claimInterface: vi.fn().mockResolvedValue(undefined),
  transferOut: vi.fn().mockResolvedValue(undefined),
  configuration: { // Ensure configuration structure matches expected access
    interfaces: [{
      alternates: [{
        endpoints: [{ direction: 'out', endpointNumber: 1 }]
      }]
    }]
  },
};

const mockUsb = {
  requestDevice: vi.fn().mockResolvedValue(mockDevice),
};

Object.defineProperty(window, 'navigator', {
  writable: true,
  value: { usb: mockUsb },
});

// Mock TextEncoder.encode directly as a spy.
const mockTextEncoderEncode = vi.fn((str: string) => {
  // Simulate TextEncoder.encode by converting string to Uint8Array
  const encoder = new global.TextEncoder(); // Use actual TextEncoder for encoding logic
  return encoder.encode(str);
});

// Mock the TextEncoder constructor to return an object with the mocked encode method.
const mockTextEncoder = {
  encode: mockTextEncoderEncode,
};

vi.stubGlobal('TextEncoder', vi.fn().mockImplementation(() => mockTextEncoder));

describe('Printer Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDevice.open.mockResolvedValue(undefined);
    mockDevice.selectConfiguration.mockResolvedValue(undefined);
    mockDevice.claimInterface.mockResolvedValue(undefined);
    mockDevice.transferOut.mockResolvedValue(undefined);
    mockUsb.requestDevice.mockResolvedValue(mockDevice);
    
    // Reset TextEncoder mocks
    mockTextEncoderConstructor.mockClear();
    mockTextEncoderEncode.mockClear();
  });

  describe('connectToPrinter', () => {
    it('should connect to the printer', async () => {
      await connectToPrinter();
      expect(mockUsb.requestDevice).toHaveBeenCalledTimes(1);
      expect(mockDevice.open).toHaveBeenCalledTimes(1);
      expect(mockDevice.selectConfiguration).toHaveBeenCalledWith(1);
      expect(mockDevice.claimInterface).toHaveBeenCalledWith(0);
    });

    it('should throw error if WebUSB not supported', async () => {
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: { usb: undefined },
      });
      await expect(connectToPrinter()).rejects.toThrow('WebUSB not supported in this browser.');
    });

    it('should throw error if device connection fails', async () => {
      const connectionError = new Error('Device not found');
      mockUsb.requestDevice.mockRejectedValue(connectionError);
      await expect(connectToPrinter()).rejects.toThrow('Device not found');
    });
  });

  describe('printReceipt', () => {
    it('should send correct ESC/POS commands for a receipt', async () => {
      const mockData = {
        storeName: 'Store A',
        address: '123 Main St',
        saleId: 'S12345',
        date: '2023-10-27',
        items: [{ name: 'Product 1', qty: 1, price: 10.5, total: 10.5 }],
        total: 10.5,
        payments: [{ method: 'Cash', amount: 10.5 }],
      };

      await printReceipt(mockDevice as any, mockData);

      // Recalculated expected transferOut calls based on component code logic:
      // INIT(1) + ALIGN CENTER(1) + BOLD ON(1) + ENCODE storeName(1) + NORMAL(1) + ENCODE address(1) + BLANK(1) + ALIGN LEFT(1) + ENCODE saleId(1) + ENCODE date(1) + DIVIDER(1) + ITEM loop (1 call per item, here 1 item) + DIVIDER(1) + BOLD ON(1) + ALIGN RIGHT(1) + ENCODE total(1) + BLANK(1) + ALIGN CENTER(1) + ENCODE thank you(1) + BLANK LINES(3) + CUT(1) = 25 calls
      expect(mockDevice.transferOut).toHaveBeenCalledTimes(25); 

      // Specific command checks using Uint8Array
      expect(mockDevice.transferOut).toHaveBeenCalledWith(1, new Uint8Array([0x1B, 0x40])); // ESC @ (INIT)
      expect(mockDevice.transferOut).toHaveBeenCalledWith(1, new Uint8Array([0x1D, 0x56, 0x41, 0x10])); // GS V a 16 (CUT)
      expect(mockDevice.transferOut).toHaveBeenCalledWith(1, new Uint8Array([0x1B, 0x61, 0x01])); // ESC a 1 (CENTER align)
      expect(mockDevice.transferOut).toHaveBeenCalledWith(1, new Uint8Array([0x1B, 0x21, 0x01])); // ESC ! 1 (BOLD ON)
      expect(mockDevice.transferOut).toHaveBeenCalledWith(1, new Uint8Array([0x1B, 0x21, 0x00])); // ESC ! 0 (BOLD OFF)

      // Check for encoded text calls - using the mocked TextEncoder.encode
      expect(mockTextEncoderEncode).toHaveBeenCalledWith('Store A\n');
      expect(mockTextEncoderEncode).toHaveBeenCalledWith('123 Main St\n\n');
      expect(mockTextEncoderEncode).toHaveBeenCalledWith('Sale ID: S12345\n');
      expect(mockTextEncoderEncode).toHaveBeenCalledWith('Date: 2023-10-27\n');
      expect(mockTextEncoderEncode).toHaveBeenCalledWith('--------------------------------\n');
      expect(mockTextEncoderEncode).toHaveBeenCalledWith(' 1x Product 1                     10.50\n');
      // Ensure transferOut is called with the result of the mocked encode
      expect(mockDevice.transferOut).toHaveBeenCalledWith(1, expect.arrayContaining(mockTextEncoderEncode(' 1x Product 1                     10.50\n')));
      expect(mockTextEncoderEncode).toHaveBeenCalledWith('--------------------------------\n');
      expect(mockTextEncoderEncode).toHaveBeenCalledWith('TOTAL: 10.50\n');
      expect(mockTextEncoderEncode).toHaveBeenCalledWith('\n');
      expect(mockTextEncoderEncode).toHaveBeenCalledWith('Thank you for shopping!\n');
      expect(mockTextEncoderEncode).toHaveBeenCalledWith('\n\n\n');
    });

    it('should handle item formatting correctly', async () => {
        const mockData = {
          storeName: 'Test Store',
          address: 'Addr',
          saleId: 'X1',
          date: '2023-01-01',
          items: [{ name: 'Super Long Product Name That Needs Truncation', qty: 2, price: 5.0, total: 10.0 }],
          total: 10.0,
          payments: [{ method: 'Card', amount: 10.0 }],
        };

        await printReceipt(mockDevice as any, mockData);

        // Check if product name is truncated and padded, total is right-aligned
        const expectedLine = ' 2x Super Long Product Na         10.00\n';
        expect(mockTextEncoderEncode).toHaveBeenCalledWith(expectedLine);
        expect(mockDevice.transferOut).toHaveBeenCalledWith(1, expect.arrayContaining(mockTextEncoderEncode(expectedLine)));
    });

    it('should throw error if printing fails', async () => {
      mockDevice.transferOut.mockRejectedValue(new Error('Printer error'));
      const mockData = {
        storeName: 'Store A',
        address: '123 Main St',
        saleId: 'S12345',
        date: '2023-10-27',
        items: [{ name: 'Product 1', qty: 1, price: 10.5, total: 10.5 }],
        total: 10.5,
        payments: [{ method: 'Cash', amount: 10.5 }],
      };
      await expect(printReceipt(mockDevice as any, mockData)).rejects.toThrow('Printer error');
    });
  });
});
