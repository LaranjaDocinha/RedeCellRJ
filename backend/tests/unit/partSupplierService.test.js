import { partSupplierService } from '../../src/services/partSupplierService.js';
import { vi } from 'vitest';
import { AppError } from '../../src/utils/errors.js';
// Mock ../db/index.js
vi.mock('../../src/db/index.js', () => {
    const mockQuery = vi.fn();
    return {
        __esModule: true,
        default: { query: mockQuery },
        getPool: () => ({ query: mockQuery }), // Mock getPool to return an object with a query function
    };
});
describe('partSupplierService', () => {
    let mockedDb;
    beforeAll(async () => {
        mockedDb = (await import('../../src/db/index.js')).getPool();
    });
    afterEach(() => {
        vi.clearAllMocks();
    });
    describe('getSuppliersForPart', () => {
        it('should return a list of suppliers for a given part', async () => {
            const mockSuppliers = [
                { id: 1, name: 'Supplier A', cost: 100, lead_time_days: 5 },
                { id: 2, name: 'Supplier B', cost: 120, lead_time_days: 3 },
            ];
            mockedDb.query.mockResolvedValueOnce({ rows: mockSuppliers });
            const suppliers = await partSupplierService.getSuppliersForPart(1);
            expect(suppliers).toEqual(mockSuppliers);
            expect(mockedDb.query).toHaveBeenCalledWith(expect.any(String), [1]);
        });
    });
    describe('addSupplierToPart', () => {
        it('should add a supplier to a part', async () => {
            const mockPayload = { part_id: 1, supplier_id: 1, cost: 100, lead_time_days: 5 };
            const mockReturn = { id: 1, ...mockPayload };
            mockedDb.query.mockResolvedValueOnce({ rows: [] }); // No existing association
            mockedDb.query.mockResolvedValueOnce({ rows: [mockReturn] });
            const result = await partSupplierService.addSupplierToPart(mockPayload);
            expect(result).toEqual(mockReturn);
            expect(mockedDb.query).toHaveBeenCalledWith('SELECT id FROM part_suppliers WHERE part_id = $1 AND supplier_id = $2', [1, 1]);
            expect(mockedDb.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO part_suppliers'), [1, 1, 100, 5, undefined]);
        });
        it('should throw an error if the supplier is already associated with the part', async () => {
            const mockPayload = { part_id: 1, supplier_id: 1, cost: 100 };
            mockedDb.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Existing association
            await expect(partSupplierService.addSupplierToPart(mockPayload)).rejects.toThrow(new AppError('This supplier is already associated with this part', 409));
        });
    });
    describe('updateSupplierForPart', () => {
        it('should update a supplier for a part', async () => {
            const mockPayload = { cost: 110, lead_time_days: 4 };
            const mockReturn = { id: 1, part_id: 1, supplier_id: 1, ...mockPayload };
            mockedDb.query.mockResolvedValueOnce({ rows: [mockReturn] });
            const result = await partSupplierService.updateSupplierForPart(1, 1, mockPayload);
            expect(result).toEqual(mockReturn);
            expect(mockedDb.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE part_suppliers'), [110, 4, 1, 1]);
        });
    });
    describe('removeSupplierFromPart', () => {
        it('should remove a supplier from a part', async () => {
            mockedDb.query.mockResolvedValueOnce({ rowCount: 1 });
            const result = await partSupplierService.removeSupplierFromPart(1, 1);
            expect(result).toBe(true);
            expect(mockedDb.query).toHaveBeenCalledWith('DELETE FROM part_suppliers WHERE part_id = $1 AND supplier_id = $2 RETURNING id', [1, 1]);
        });
        it('should return false if the association does not exist', async () => {
            mockedDb.query.mockResolvedValueOnce({ rowCount: 0 });
            const result = await partSupplierService.removeSupplierFromPart(1, 1);
            expect(result).toBe(false);
        });
    });
});
