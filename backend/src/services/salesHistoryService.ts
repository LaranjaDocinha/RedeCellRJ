import { getPool } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import httpStatus from 'http-status';

interface SalesHistoryQuery {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export const getSalesHistory = async (query: SalesHistoryQuery) => {
  const { startDate, endDate, customerId, userId, page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;

  let queryText = `
    SELECT
      s.id,
      s.total_amount,
      s.sale_date,
      u.name AS user_name,
      c.name AS customer_name,
      (
        SELECT json_agg(json_build_object('method', sp.payment_method, 'amount', sp.amount))
        FROM sale_payments sp
        WHERE sp.sale_id = s.id
      ) AS payments
    FROM sales s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE 1=1
  `;

  const queryParams: (string | number)[] = [];
  let paramIndex = 1;

  if (startDate) {
    queryText += ` AND s.sale_date >= $${paramIndex++}`;
    queryParams.push(startDate);
  }
  if (endDate) {
    queryText += ` AND s.sale_date <= $${paramIndex++}`;
    queryParams.push(endDate);
  }
  if (customerId) {
    queryText += ` AND s.customer_id = $${paramIndex++}`;
    queryParams.push(customerId);
  }
  if (userId) {
    queryText += ` AND s.user_id = $${paramIndex++}`;
    queryParams.push(userId);
  }

  queryText += `
    ORDER BY s.sale_date DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++};
  `;
  queryParams.push(limit, offset);

  const { rows } = await getPool().query(queryText, queryParams);

  // Get total count for pagination
  let countQueryText = `
    SELECT COUNT(*)
    FROM sales s
    WHERE 1=1
  `;
  const countQueryParams: (string | number)[] = [];
  let countParamIndex = 1;

  if (startDate) {
    countQueryText += ` AND s.sale_date >= $${countParamIndex++}`;
    countQueryParams.push(startDate);
  }
  if (endDate) {
    countQueryText += ` AND s.sale_date <= $${countParamIndex++}`;
    countQueryParams.push(endDate);
  }
  if (customerId) {
    countQueryText += ` AND s.customer_id = $${countParamIndex++}`;
    countQueryParams.push(customerId);
  }
  if (userId) {
    countQueryText += ` AND s.user_id = $${countParamIndex++}`;
    countQueryParams.push(userId);
  }

  const { rows: countRows } = await getPool().query(countQueryText, countQueryParams);
  const totalSales = parseInt(countRows[0].count, 10);

  return {
    sales: rows,
    totalSales,
    page,
    limit,
    totalPages: Math.ceil(totalSales / limit),
  };
};

export const getSaleDetails = async (saleId: string) => {
  const queryText = `
    SELECT
      s.id,
      s.total_amount,
      s.sale_date,
      u.name AS user_name,
      c.name AS customer_name,
      c.email AS customer_email,
      c.phone AS customer_phone,
      (
        SELECT json_agg(json_build_object(
          'product_name', p.name,
          'sku', p.sku,
          'quantity', si.quantity,
          'unit_price', si.unit_price,
          'total_price', si.total_price
        ))
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = s.id
      ) AS items,
      (
        SELECT json_agg(json_build_object('method', sp.payment_method, 'amount', sp.amount, 'details', sp.transaction_details))
        FROM sale_payments sp
        WHERE sp.sale_id = s.id
      ) AS payments
    FROM sales s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE s.id = $1;
  `;
  const { rows } = await getPool().query(queryText, [saleId]);

  if (!rows.length) {
    throw new AppError('Sale not found', httpStatus.NOT_FOUND);
  }

  return rows[0];
};
