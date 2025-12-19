import { storeCreditService } from '../../../src/services/storeCreditService';
import { vi } from 'vitest';
vi.mock('../../../src/db/index.js', () => {
    const mockQuery = vi.fn();
    const mockClient = {
        query: mockQuery,
        release: vi.fn(),
    };
    const mockPool = {
        connect: vi.fn(() => Promise.resolve(mockClient)),
        query: mockQuery,
    };
    return {
        default: mockPool,
        __esModule: true,
    };
});
describe('storeCreditService', () => {
    let mockedDb;
    let mockClient;
    beforeAll(async () => {
        mockedDb = vi.mocked(await import('../../../src/db/index.js'));
        mockClient = await mockedDb.default.connect();
    });
    afterEach(() => {
        vi.clearAllMocks();
        mockClient.query.mockReset();
    });
    describe('addCredit', () => {
        it('should add credit to a customer and record the transaction', async () => {
            mockClient.query.mockResolvedValue({ rows: [], rowCount: 1 });
            await storeCreditService.addCredit(1, 100, 'Test credit');
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('UPDATE customers SET store_credit_balance = store_credit_balance + $1 WHERE id = $2', [100, 1]);
            expect(mockClient.query).toHaveBeenCalledWith('INSERT INTO store_credit_transactions (customer_id, amount, type, reason, related_id) VALUES ($1, $2, $3, $4, $5)', [1, 100, 'credit', 'Test credit', undefined]);
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalled();
        });
        it('should roll back the transaction on error', async () => {
            const dbError = new Error('DB error');
            mockClient.query.mockRejectedValueOnce(dbError);
            await expect(storeCreditService.addCredit(1, 100, 'Test credit')).rejects.toThrow(dbError);
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
    describe('useCredit', () => {
        it('should use credit from a customer and record the transaction', async () => {
            // Mock transaction start
            mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // BEGIN
            // Mock SELECT customer balance
            mockClient.query.mockResolvedValueOnce({ rows: [{ store_credit_balance: '200.00' }] });
            // Mock UPDATE customer balance
            mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });
            // Mock INSERT transaction
            mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });
            // Mock transaction commit
            mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // COMMIT
            await storeCreditService.useCredit(1, 100, 'Test debit');
            expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
            expect(mockClient.query).toHaveBeenNthCalledWith(2, 'SELECT store_credit_balance FROM customers WHERE id = $1 FOR UPDATE', [1]);
            expect(mockClient.query).toHaveBeenNthCalledWith(3, 'UPDATE customers SET store_credit_balance = store_credit_balance - $1 WHERE id = $2', [100, 1]);
            expect(mockClient.query).toHaveBeenNthCalledWith(4, 'INSERT INTO store_credit_transactions (customer_id, amount, type, reason, related_id) VALUES ($1, $2, $3, $4, $5)', [1, -100, 'debit', 'Test debit', undefined]);
            expect(mockClient.query).toHaveBeenNthCalledWith(5, 'COMMIT');
            expect(mockClient.release).toHaveBeenCalled();
        });
        it('should throw an error for insufficient balance', async () => {
            // Mock transaction start
            mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // BEGIN
            // Mock SELECT customer balance
            mockClient.query.mockResolvedValueOnce({ rows: [{ store_credit_balance: '50.00' }] });
            // Mock transaction rollback
            mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // ROLLBACK
            await expect(storeCreditService.useCredit(1, 100, 'Test debit')).rejects.toThrow('Insufficient store credit balance');
            expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
            expect(mockClient.query).toHaveBeenNthCalledWith(2, 'SELECT store_credit_balance FROM customers WHERE id = $1 FOR UPDATE', [1]);
            expect(mockClient.query).toHaveBeenNthCalledWith(3, 'ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });
        it('should roll back the transaction on error', async () => {
            const dbError = new Error('DB error');
            // Mock transaction start
            mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // BEGIN
            // Mock SELECT customer balance
            mockClient.query.mockResolvedValueOnce({ rows: [{ store_credit_balance: '200.00' }] });
            // Mock the failing query (e.g., UPDATE)
            mockClient.query.mockRejectedValueOnce(dbError);
            // Mock transaction rollback
            mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // ROLLBACK
            await expect(storeCreditService.useCredit(1, 100, 'Test debit')).rejects.toThrow(dbError);
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
    describe('getCustomerTransactionHistory', () => {
        it('should return the customer transaction history', async () => {
            const mockHistory = [
                { id: 1, amount: 100, type: 'credit' },
                { id: 2, amount: -50, type: 'debit' },
            ];
            mockedDb.default.query.mockResolvedValueOnce({ rows: mockHistory });
            const history = await storeCreditService.getCustomerTransactionHistory(1);
            expect(history).toEqual(mockHistory);
            expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM store_credit_transactions WHERE customer_id = $1 ORDER BY created_at DESC', [1]);
        });
    });
});
