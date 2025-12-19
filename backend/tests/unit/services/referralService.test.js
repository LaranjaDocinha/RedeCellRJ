import { vi } from 'vitest';
import { referralService } from '../../../src/services/referralService';
import { couponService } from '../../../src/services/couponService';
// Mock dependencies
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
vi.mock('../../../src/services/couponService.js', () => ({
    couponService: {
        createCoupon: vi.fn(),
    },
}));
// Mock nanoid
vi.mock('nanoid', () => ({
    customAlphabet: vi.fn(() => vi.fn(() => 'TESTCODE123')),
}));
describe('ReferralService', () => {
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
    describe('generateReferralCode', () => {
        it('should generate a referral code and save it to the database', async () => {
            mockClient.query.mockResolvedValue({ rows: [], rowCount: 1 });
            const customerId = 1;
            const code = await referralService.generateReferralCode(customerId);
            expect(code).toBe('TESTCODE123');
            expect(mockClient.query).toHaveBeenCalledWith('INSERT INTO referrals (referrer_customer_id, referral_code) VALUES ($1, $2)', [customerId, 'TESTCODE123']);
        });
    });
    describe('applyReferralCode', () => {
        it('should apply a referral code to a new customer', async () => {
            const mockReferralId = { id: 5 };
            mockClient.query.mockResolvedValue({ rows: [mockReferralId], rowCount: 1 });
            const referralCode = 'TESTCODE123';
            const newCustomerId = 2;
            const result = await referralService.applyReferralCode(referralCode, newCustomerId);
            expect(result).toEqual(mockReferralId);
            expect(mockClient.query).toHaveBeenCalledWith('UPDATE referrals SET referred_customer_id = $1 WHERE referral_code = $2 AND referred_customer_id IS NULL RETURNING id', [newCustomerId, referralCode]);
        });
        it('should return undefined if the code is already used or invalid', async () => {
            mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
            const referralCode = 'USEDCODE456';
            const newCustomerId = 3;
            const result = await referralService.applyReferralCode(referralCode, newCustomerId);
            expect(result).toBeUndefined();
        });
    });
    describe('completeReferral', () => {
        it('should complete a referral, update status, and create coupons', async () => {
            const mockReferral = {
                id: 5,
                referrer_customer_id: 1,
                referred_customer_id: 2,
                status: 'pending',
            };
            mockClient.query.mockResolvedValueOnce({ rows: [mockReferral], rowCount: 1 }); // For SELECT
            mockClient.query.mockResolvedValue({ rows: [], rowCount: 1 }); // For UPDATE
            vi.mocked(couponService.createCoupon).mockResolvedValue({}); // Mock coupon creation
            await referralService.completeReferral(mockReferral.referred_customer_id);
            // Check if referral was fetched
            expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM referrals WHERE referred_customer_id = $1 AND status = $2', [mockReferral.referred_customer_id, 'pending']);
            // Check if referral status was updated
            expect(mockClient.query).toHaveBeenCalledWith('UPDATE referrals SET status = $1, completed_at = NOW() WHERE id = $2', ['completed', mockReferral.id]);
            // Check if coupons were created
            expect(couponService.createCoupon).toHaveBeenCalledTimes(2);
            expect(vi.mocked(couponService.createCoupon).mock.calls[0][0]).toMatchObject({
                type: 'fixed_amount',
                value: 10,
            });
            expect(vi.mocked(couponService.createCoupon).mock.calls[1][0]).toMatchObject({
                type: 'fixed_amount',
                value: 10,
            });
        });
        it('should do nothing if no pending referral is found', async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // No referral found
            await referralService.completeReferral(999); // Non-existent customer
            // Check that only the SELECT query was called
            expect(mockClient.query).toHaveBeenCalledTimes(1);
            expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM referrals WHERE referred_customer_id = $1 AND status = $2', [999, 'pending']);
            // Ensure no other actions were taken
            expect(couponService.createCoupon).not.toHaveBeenCalled();
        });
    });
    describe('getReferralHistory', () => {
        it('should return the referral history for a customer', async () => {
            const mockHistory = [
                { id: 1, code: 'ABC' },
                { id: 2, code: 'DEF' },
            ];
            mockClient.query.mockResolvedValue({ rows: mockHistory, rowCount: 2 });
            const customerId = 1;
            const history = await referralService.getReferralHistory(customerId);
            expect(history).toEqual(mockHistory);
            expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM referrals WHERE referrer_customer_id = $1', [customerId]);
        });
    });
});
