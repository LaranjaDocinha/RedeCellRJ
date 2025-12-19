import { getPool } from '../db/index.js';
export const createAddress = async (customerId, address) => {
    const { address_line1, address_line2, city, state, zip_code, country, is_default } = address;
    const result = await getPool().query('INSERT INTO customer_addresses (customer_id, address_line1, address_line2, city, state, zip_code, country, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [customerId, address_line1, address_line2, city, state, zip_code, country, is_default]);
    return result.rows[0];
};
export const updateAddress = async (id, address) => {
    const { address_line1, address_line2, city, state, zip_code, country, is_default } = address;
    const result = await getPool().query('UPDATE customer_addresses SET address_line1 = $1, address_line2 = $2, city = $3, state = $4, zip_code = $5, country = $6, is_default = $7 WHERE id = $8 RETURNING *', [address_line1, address_line2, city, state, zip_code, country, is_default, id]);
    return result.rows[0];
};
export const deleteAddress = async (id) => {
    const result = await getPool().query('DELETE FROM customer_addresses WHERE id = $1 RETURNING *', [
        id,
    ]);
    return result.rows[0];
};
export const getAddressesByCustomerId = async (customerId) => {
    const result = await getPool().query('SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY is_default DESC, created_at DESC', [customerId]);
    return result.rows;
};
