import { getPool } from '../db/index.js';

export const createPayable = async (payableData: any) => {
  const { supplier_id, description, amount, due_date, branch_id } = payableData;
  const result = await getPool().query(
    'INSERT INTO accounts_payable (supplier_id, description, amount, due_date, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [supplier_id, description, amount, due_date, branch_id],
  );
  return result.rows[0];
};

export const getPayables = async (
  branchId?: number,
  status?: string,
  startDate?: string,
  endDate?: string,
) => {
  let query =
    'SELECT ap.*, s.name as supplier_name FROM accounts_payable ap LEFT JOIN suppliers s ON ap.supplier_id = s.id';
  const params = [];
  const conditions = [];
  let paramIndex = 1;

  if (branchId) {
    conditions.push(`ap.branch_id = $${paramIndex++}`);
    params.push(branchId);
  }
  if (status) {
    conditions.push(`ap.status = $${paramIndex++}`);
    params.push(status);
  }
  if (startDate) {
    conditions.push(`ap.due_date >= $${paramIndex++}`);
    params.push(startDate);
  }
  if (endDate) {
    conditions.push(`ap.due_date <= $${paramIndex++}`);
    params.push(endDate);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY ap.due_date ASC';

  const result = await getPool().query(query, params);
  return result.rows;
};

export const updatePayableStatus = async (id: number, status: string, paidDate?: string) => {
  const result = await getPool().query(
    'UPDATE accounts_payable SET status = $1, paid_date = $2 WHERE id = $3 RETURNING *',
    [status, paidDate, id],
  );
  return result.rows[0];
};

export const createReceivable = async (receivableData: any) => {
  const { customer_id, description, amount, due_date, branch_id } = receivableData;
  const result = await getPool().query(
    'INSERT INTO accounts_receivable (customer_id, description, amount, due_date, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [customer_id, description, amount, due_date, branch_id],
  );
  return result.rows[0];
};

export const getReceivables = async (
  branchId?: number,
  status?: string,
  startDate?: string,
  endDate?: string,
) => {
  let query =
    'SELECT ar.*, c.name as customer_name FROM accounts_receivable ar LEFT JOIN customers c ON ar.customer_id = c.id';
  const params = [];
  const conditions = [];
  let paramIndex = 1;

  if (branchId) {
    conditions.push(`ar.branch_id = $${paramIndex++}`);
    params.push(branchId);
  }
  if (status) {
    conditions.push(`ar.status = $${paramIndex++}`);
    params.push(status);
  }
  if (startDate) {
    conditions.push(`ar.due_date >= $${paramIndex++}`);
    params.push(startDate);
  }
  if (endDate) {
    conditions.push(`ar.due_date <= $${paramIndex++}`);
    params.push(endDate);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY ar.due_date ASC';

  const result = await getPool().query(query, params);
  return result.rows;
};

export const updateReceivableStatus = async (id: number, status: string, receivedDate?: string) => {
  const result = await getPool().query(
    'UPDATE accounts_receivable SET status = $1, received_date = $2 WHERE id = $3 RETURNING *',
    [status, receivedDate, id],
  );
  return result.rows[0];
};
