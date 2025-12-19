import { getPool } from '../db/index.js';
export const createRequest = async (requestData) => {
    const { user_id, branch_id, amount, description, receipt_url } = requestData;
    const result = await getPool().query('INSERT INTO expense_reimbursements (user_id, branch_id, amount, description, receipt_url) VALUES ($1, $2, $3, $4, $5) RETURNING *', [user_id, branch_id, amount, description, receipt_url]);
    return result.rows[0];
};
export const getRequests = async (status, branchId) => {
    let query = 'SELECT er.*, u.name as user_name FROM expense_reimbursements er JOIN users u ON er.user_id = u.id';
    const params = [];
    let paramIndex = 1;
    if (status) {
        query += ` WHERE er.status = $${paramIndex++}`;
        params.push(status);
    }
    if (branchId) {
        query += `${params.length > 0 ? ' AND' : ' WHERE'} er.branch_id = $${paramIndex++}`;
        params.push(branchId);
    }
    const result = await getPool().query(query, params);
    return result.rows;
};
export const getUserRequests = async (userId) => {
    const result = await getPool().query('SELECT * FROM expense_reimbursements WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
};
export const approveRequest = async (id, reviewerId) => {
    const result = await getPool().query("UPDATE expense_reimbursements SET status = 'approved', reviewer_id = $1, review_date = NOW() WHERE id = $2 RETURNING *", [reviewerId, id]);
    return result.rows[0];
};
export const rejectRequest = async (id, reviewerId) => {
    const result = await getPool().query("UPDATE expense_reimbursements SET status = 'rejected', reviewer_id = $1, review_date = NOW() WHERE id = $2 RETURNING *", [reviewerId, id]);
    return result.rows[0];
};
