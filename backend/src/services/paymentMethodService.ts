import { getPool } from '../db/index.js';

export const createPaymentMethod = async (customerId: number, paymentMethod: any) => {
  const { card_type, last_four, expiration_date, token, is_default } = paymentMethod;
  const result = await getPool().query(
    'INSERT INTO customer_payment_methods (customer_id, card_type, last_four, expiration_date, token, is_default) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [customerId, card_type, last_four, expiration_date, token, is_default],
  );
  return result.rows[0];
};

export const updatePaymentMethod = async (id: number, paymentMethod: any) => {
  const { card_type, last_four, expiration_date, token, is_default } = paymentMethod;
  const result = await getPool().query(
    'UPDATE customer_payment_methods SET card_type = $1, last_four = $2, expiration_date = $3, token = $4, is_default = $5 WHERE id = $6 RETURNING *',
    [card_type, last_four, expiration_date, token, is_default, id],
  );
  return result.rows[0];
};

export const deletePaymentMethod = async (id: number) => {
  const result = await getPool().query(
    'DELETE FROM customer_payment_methods WHERE id = $1 RETURNING *',
    [id],
  );
  return result.rows[0];
};

export const getPaymentMethodsByCustomerId = async (customerId: number) => {
  const result = await getPool().query(
    'SELECT * FROM customer_payment_methods WHERE customer_id = $1 ORDER BY is_default DESC, created_at DESC',
    [customerId],
  );
  return result.rows;
};
