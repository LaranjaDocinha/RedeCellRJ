import pool from '../db/index.js';
import { customAlphabet } from 'nanoid';
import { couponService } from './couponService.js'; // Assuming couponService exists
const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
class ReferralService {
    async generateReferralCode(customerId) {
        const code = nanoid();
        await pool.query('INSERT INTO referrals (referrer_customer_id, referral_code) VALUES ($1, $2)', [customerId, code]);
        return code;
    }
    async applyReferralCode(referralCode, newCustomerId) {
        const result = await pool.query('UPDATE referrals SET referred_customer_id = $1 WHERE referral_code = $2 AND referred_customer_id IS NULL RETURNING id', [newCustomerId, referralCode]);
        return result.rows[0];
    }
    async completeReferral(referredCustomerId) {
        const referralResult = await pool.query('SELECT * FROM referrals WHERE referred_customer_id = $1 AND status = $2', [referredCustomerId, 'pending']);
        if (referralResult.rows.length > 0) {
            const referral = referralResult.rows[0];
            await pool.query('UPDATE referrals SET status = $1, completed_at = NOW() WHERE id = $2', [
                'completed',
                referral.id,
            ]);
            // Create coupons for referrer and referred
            // This is a simplified example. In a real app, the coupon details would be more configurable.
            await couponService.createCoupon({
                code: `REF-${nanoid()}`,
                type: 'fixed_amount',
                value: 10,
                start_date: new Date().toISOString(), // Modificado
                is_active: true,
                // You might want to associate the coupon with the customer
            });
            await couponService.createCoupon({
                code: `REF-${nanoid()}`,
                type: 'fixed_amount',
                value: 10,
                start_date: new Date().toISOString(), // Modificado
                is_active: true,
            });
        }
    }
    async getReferralHistory(customerId) {
        console.log('Fetching referral history for customerId:', customerId);
        const result = await pool.query('SELECT * FROM referrals WHERE referrer_customer_id = $1', [
            customerId,
        ]);
        console.log('Referral history query result:', result.rows);
        return result.rows;
    }
}
export const referralService = new ReferralService();
