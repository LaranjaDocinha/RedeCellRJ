import { couponService } from '../../../src/services/couponService';
import { vi } from 'vitest';

vi.mock('../../../src/db/index.js', () => {
  const mockQuery = vi.fn();
  return {
    default: {
      query: mockQuery,
    },
    __esModule: true,
  };
});

describe('couponService', () => {
  let mockedDb: any;

  beforeAll(async () => {
    mockedDb = vi.mocked(await import('../../../src/db/index.js'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCoupons', () => {
    it('should return a list of coupons', async () => {
      const mockCoupons = [
        { id: 1, code: 'SUMMER20', type: 'percentage', value: 20 },
        { id: 2, code: 'FALL10', type: 'fixed_amount', value: 10 },
      ];
      mockedDb.default.query.mockResolvedValueOnce({ rows: mockCoupons });

      const coupons = await couponService.getAllCoupons();

      expect(coupons).toEqual(mockCoupons);
      expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM coupons');
    });

    it('should return an empty array if no coupons are found', async () => {
      mockedDb.default.query.mockResolvedValueOnce({ rows: [] });

      const coupons = await couponService.getAllCoupons();

      expect(coupons).toEqual([]);
      expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM coupons');
    });
  });

  describe('getCouponByCode', () => {
    it('should return a coupon for a valid code', async () => {
      const mockCoupon = { id: 1, code: 'SUMMER20', type: 'percentage', value: 20 };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [mockCoupon] });

      const coupon = await couponService.getCouponByCode('SUMMER20');

      expect(coupon).toEqual(mockCoupon);
      expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM coupons WHERE code = $1', [
        'SUMMER20',
      ]);
    });

    it('should return undefined if no coupon is found for the given code', async () => {
      mockedDb.default.query.mockResolvedValueOnce({ rows: [] });

      const coupon = await couponService.getCouponByCode('INVALID');

      expect(coupon).toBeUndefined();
      expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM coupons WHERE code = $1', [
        'INVALID',
      ]);
    });
  });

  describe('getCouponById', () => {
    it('should return a coupon for a valid id', async () => {
      const mockCoupon = { id: 1, code: 'SUMMER20', type: 'percentage', value: 20 };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [mockCoupon] });

      const coupon = await couponService.getCouponById(1);

      expect(coupon).toEqual(mockCoupon);
      expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM coupons WHERE id = $1', [
        1,
      ]);
    });

    it('should return undefined if no coupon is found for the given id', async () => {
      mockedDb.default.query.mockResolvedValueOnce({ rows: [] });

      const coupon = await couponService.getCouponById(999);

      expect(coupon).toBeUndefined();
      expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM coupons WHERE id = $1', [
        999,
      ]);
    });
  });

  describe('createCoupon', () => {
    it('should create a new coupon', async () => {
      const newCouponData = {
        code: 'NEW25',
        type: 'percentage' as const,
        value: 25,
        start_date: '2023-01-01',
      };
      const createdCoupon = { id: 3, ...newCouponData };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [createdCoupon] });

      const coupon = await couponService.createCoupon(newCouponData);

      expect(coupon).toEqual(createdCoupon);
      expect(mockedDb.default.query).toHaveBeenCalledWith(
        'INSERT INTO coupons (code, type, value, start_date, end_date, min_purchase_amount, max_uses, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [
          newCouponData.code,
          newCouponData.type,
          newCouponData.value,
          newCouponData.start_date,
          undefined,
          undefined,
          undefined,
          undefined,
        ],
      );
    });

    it('should throw an error if the database query fails', async () => {
      const newCouponData = {
        code: 'ERROR',
        type: 'percentage' as const,
        value: 10,
        start_date: '2023-01-01',
      };
      const dbError = new Error('DB error');
      mockedDb.default.query.mockRejectedValueOnce(dbError);

      await expect(couponService.createCoupon(newCouponData)).rejects.toThrow(dbError);
    });
  });

  describe('updateCoupon', () => {
    it('should update an existing coupon', async () => {
      const updatedData = { value: 30 };
      const updatedCoupon = { id: 1, code: 'SUMMER20', type: 'percentage', value: 30 };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [updatedCoupon] });

      const coupon = await couponService.updateCoupon('SUMMER20', updatedData);

      expect(coupon).toEqual(updatedCoupon);
      expect(mockedDb.default.query).toHaveBeenCalledWith(
        'UPDATE coupons SET value = $1, updated_at = current_timestamp WHERE code = $2 RETURNING *',
        [30, 'SUMMER20'],
      );
    });

    it('should return undefined if no coupon is found for the given code', async () => {
      mockedDb.default.query.mockResolvedValueOnce({ rows: [] });

      const coupon = await couponService.updateCoupon('INVALID', { value: 50 });

      expect(coupon).toBeUndefined();
    });

    it('should throw an error if the database query fails', async () => {
      const updatedData = { value: 40 };
      const dbError = new Error('DB error');
      mockedDb.default.query.mockRejectedValueOnce(dbError);

      await expect(couponService.updateCoupon('SUMMER20', updatedData)).rejects.toThrow(dbError);
    });

    it('should return the existing coupon if no fields are updated', async () => {
      const existingCoupon = { id: 1, code: 'SUMMER20', type: 'percentage', value: 20 };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [existingCoupon] });

      const coupon = await couponService.updateCoupon('SUMMER20', {});

      expect(coupon).toEqual(existingCoupon);
      expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM coupons WHERE code = $1', [
        'SUMMER20',
      ]);
    });

    it('should return undefined if no coupon is found and no fields are updated', async () => {
      mockedDb.default.query.mockResolvedValueOnce({ rows: [] });

      const coupon = await couponService.updateCoupon('INVALID', {});

      expect(coupon).toBeUndefined();
    });
  });

  describe('deleteCoupon', () => {
    it('should return true when a coupon is deleted successfully', async () => {
      mockedDb.default.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await couponService.deleteCoupon(1);

      expect(result).toBe(true);
      expect(mockedDb.default.query).toHaveBeenCalledWith(
        'DELETE FROM coupons WHERE id = $1 RETURNING id',
        [1],
      );
    });

    it('should return false if no coupon is found for the given id', async () => {
      mockedDb.default.query.mockResolvedValueOnce({ rowCount: 0 });

      const result = await couponService.deleteCoupon(999);

      expect(result).toBe(false);
    });
  });

  describe('deleteCouponByCode', () => {
    it('should return true when a coupon is deleted successfully', async () => {
      mockedDb.default.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await couponService.deleteCouponByCode('SUMMER20');

      expect(result).toBe(true);
      expect(mockedDb.default.query).toHaveBeenCalledWith(
        'DELETE FROM coupons WHERE code = $1 RETURNING id',
        ['SUMMER20'],
      );
    });

    it('should return false if no coupon is found for the given code', async () => {
      mockedDb.default.query.mockResolvedValueOnce({ rowCount: 0 });

      const result = await couponService.deleteCouponByCode('INVALID');

      expect(result).toBe(false);
    });
  });

  describe('applyCoupon', () => {
    const validCoupon = {
      id: 1,
      code: 'VALID20',
      type: 'percentage' as const,
      value: 0.2,
      is_active: true,
      uses_count: 0,
      max_uses: 100,
      min_purchase_amount: 50,
      end_date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Expires tomorrow
    };

    it('should apply a valid percentage coupon', async () => {
      mockedDb.default.query.mockResolvedValueOnce({ rows: [validCoupon] });
      mockedDb.default.query.mockResolvedValueOnce({ rowCount: 1 }); // For the UPDATE

      const finalAmount = await couponService.applyCoupon('VALID20', 100);

      expect(finalAmount).toBe(80);
      expect(mockedDb.default.query).toHaveBeenCalledWith(
        'UPDATE coupons SET uses_count = uses_count + 1 WHERE code = $1',
        ['VALID20'],
      );
    });

    it('should apply a valid fixed amount coupon', async () => {
      const fixedCoupon = {
        ...validCoupon,
        code: 'FIXED10',
        type: 'fixed_amount' as const,
        value: 10,
      };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [fixedCoupon] });
      mockedDb.default.query.mockResolvedValueOnce({ rowCount: 1 });

      const finalAmount = await couponService.applyCoupon('FIXED10', 100);

      expect(finalAmount).toBe(90);
    });

    it('should throw an error for an invalid coupon code', async () => {
      mockedDb.default.query.mockResolvedValueOnce({ rows: [] });

      await expect(couponService.applyCoupon('INVALID', 100)).rejects.toThrow(
        'Coupon not applicable',
      );
    });

    it('should throw an error for an expired coupon', async () => {
      const expiredCoupon = {
        ...validCoupon,
        end_date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      }; // Expired yesterday
      mockedDb.default.query.mockResolvedValueOnce({ rows: [expiredCoupon] });

      await expect(couponService.applyCoupon(validCoupon.code, 100)).rejects.toThrow(
        'Coupon not applicable',
      );
    });

    it('should throw an error if max uses has been reached', async () => {
      const maxedOutCoupon = { ...validCoupon, uses_count: 100, max_uses: 100 };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [maxedOutCoupon] });

      await expect(couponService.applyCoupon(validCoupon.code, 100)).rejects.toThrow(
        'Coupon not applicable',
      );
    });

    it('should throw an error if minimum purchase amount is not met', async () => {
      const couponWithMin = { ...validCoupon, min_purchase_amount: 150 };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [couponWithMin] });

      await expect(couponService.applyCoupon(validCoupon.code, 100)).rejects.toThrow(
        'Coupon not applicable',
      );
    });

    it('should not allow the final amount to be less than zero', async () => {
      const highValueCoupon = {
        ...validCoupon,
        code: 'BIGTICKET',
        type: 'fixed_amount' as const,
        value: 150,
      };
      mockedDb.default.query.mockResolvedValueOnce({ rows: [highValueCoupon] });
      mockedDb.default.query.mockResolvedValueOnce({ rowCount: 1 });

      const finalAmount = await couponService.applyCoupon('BIGTICKET', 100);

      expect(finalAmount).toBe(0);
    });
  });
});
