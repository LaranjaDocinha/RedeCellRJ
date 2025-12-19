import { getPool } from '../db/index.js';
const pool = getPool();
import { partSupplierService } from './partSupplierService.js';
import { AppError } from '../utils/errors.js';
export const createPart = async (partData) => {
    const { name, sku, description, stock_quantity, suppliers = [] } = partData;
    // The 'parts' table no longer has cost_price or supplier_id
    const partResult = await pool.query('INSERT INTO parts (name, sku, description, stock_quantity) VALUES ($1, $2, $3, $4) RETURNING *', [name, sku, description, stock_quantity]);
    const newPart = partResult.rows[0];
    if (suppliers && suppliers.length > 0) {
        // Use a transaction to ensure all or nothing
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const supplier of suppliers) {
                await partSupplierService.addSupplierToPart({
                    part_id: newPart.id,
                    ...supplier,
                });
            }
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            // Optionally, delete the created part if supplier association fails
            await deletePart(newPart.id);
            throw new AppError('Failed to associate suppliers, rolling back part creation.', 500, error);
        }
        finally {
            client.release();
        }
    }
    // Refetch the part with its suppliers
    return getPartById(newPart.id);
};
export const getAllParts = async () => {
    const query = `
    WITH supplier_info AS (
      SELECT
        ps.part_id,
        s.id AS supplier_id,
        s.name AS supplier_name,
        ps.cost,
        ps.lead_time_days,
        ps.supplier_part_number,
        ROW_NUMBER() OVER(PARTITION BY ps.part_id ORDER BY ps.cost ASC, s.name ASC) as rn,
        COUNT(*) OVER(PARTITION BY ps.part_id) as supplier_count
      FROM part_suppliers ps
      JOIN suppliers s ON s.id = ps.supplier_id
    ),
    preferred_supplier AS (
      SELECT * FROM supplier_info WHERE rn = 1
    )
    SELECT
      p.*,
      COALESCE(ps.supplier_count, 0) as supplier_count,
      ps.supplier_id as preferred_supplier_id,
      ps.supplier_name as preferred_supplier_name,
      ps.cost as preferred_supplier_cost
    FROM parts p
    LEFT JOIN preferred_supplier ps ON p.id = ps.part_id
    ORDER BY p.name ASC;
  `;
    const result = await pool.query(query);
    return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        description: row.description,
        stock_quantity: row.stock_quantity,
        created_at: row.created_at,
        updated_at: row.updated_at,
        // Constructing a simplified supplier object for the list view
        suppliers: row.preferred_supplier_id
            ? [
                {
                    id: row.preferred_supplier_id,
                    name: row.preferred_supplier_name,
                    cost: row.preferred_supplier_cost,
                    supplier_count: row.supplier_count,
                },
            ]
            : [],
    }));
};
export const getPartById = async (id) => {
    const partResult = await pool.query('SELECT * FROM parts WHERE id = $1', [id]);
    if (!partResult.rows[0]) {
        return null;
    }
    const part = partResult.rows[0];
    const suppliers = await partSupplierService.getSuppliersForPart(id);
    part.suppliers = suppliers; // Attach suppliers to the part object
    return part;
};
export const updatePart = async (id, partData) => {
    const { name, sku, description, stock_quantity, suppliers } = partData;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // 1. Update the core part details
        const partResult = await client.query('UPDATE parts SET name = COALESCE($1, name), sku = COALESCE($2, sku), description = COALESCE($3, description), stock_quantity = COALESCE($4, stock_quantity), updated_at = current_timestamp WHERE id = $5 RETURNING *', [name, sku, description, stock_quantity, id]);
        if (partResult.rows.length === 0) {
            throw new AppError('Part not found', 404);
        }
        // 2. If suppliers are provided, sync them.
        if (suppliers) {
            const existingSuppliers = await partSupplierService.getSuppliersForPart(id);
            const existingSupplierIds = existingSuppliers.map((s) => s.id);
            const incomingSupplierIds = suppliers.map((s) => s.supplier_id);
            // Suppliers to add
            const toAdd = suppliers.filter((s) => !existingSupplierIds.includes(s.supplier_id));
            for (const sup of toAdd) {
                await partSupplierService.addSupplierToPart({ part_id: id, ...sup });
            }
            // Suppliers to update
            const toUpdate = suppliers.filter((s) => existingSupplierIds.includes(s.supplier_id));
            for (const sup of toUpdate) {
                await partSupplierService.updateSupplierForPart(id, sup.supplier_id, sup);
            }
            // Suppliers to remove
            const toRemove = existingSuppliers.filter((s) => !incomingSupplierIds.includes(s.id));
            for (const sup of toRemove) {
                await partSupplierService.removeSupplierFromPart(id, sup.id);
            }
        }
        await client.query('COMMIT');
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error; // Re-throw the original error
    }
    finally {
        client.release();
    }
    return getPartById(id);
};
export const deletePart = async (id) => {
    // Thanks to `ON DELETE CASCADE`, part_suppliers will be cleaned up automatically
    const result = await pool.query('DELETE FROM parts WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
};
export const searchParts = async (searchTerm, barcode, sku) => {
    let query = `
    WITH supplier_info AS (
      SELECT
        ps.part_id,
        s.id AS supplier_id,
        s.name AS supplier_name,
        ps.cost,
        ps.lead_time_days,
        ps.supplier_part_number,
        ROW_NUMBER() OVER(PARTITION BY ps.part_id ORDER BY ps.cost ASC, s.name ASC) as rn,
        COUNT(*) OVER(PARTITION BY ps.part_id) as supplier_count
      FROM part_suppliers ps
      JOIN suppliers s ON s.id = ps.supplier_id
    ),
    preferred_supplier AS (
      SELECT * FROM supplier_info WHERE rn = 1
    )
    SELECT
      p.*,
      COALESCE(ps.supplier_count, 0) as supplier_count,
      ps.supplier_id as preferred_supplier_id,
      ps.supplier_name as preferred_supplier_name,
      ps.cost as preferred_supplier_cost
    FROM parts p
    LEFT JOIN preferred_supplier ps ON p.id = ps.part_id
  `;
    const queryParams = [];
    const conditions = [];
    let paramIndex = 1;
    if (searchTerm) {
        conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
        queryParams.push(`%${searchTerm}%`);
        paramIndex++;
    }
    if (barcode) {
        conditions.push(`p.barcode = $${paramIndex}`); // Assuming 'barcode' column exists in 'parts' table
        queryParams.push(barcode);
        paramIndex++;
    }
    if (sku) {
        conditions.push(`p.sku ILIKE $${paramIndex}`);
        queryParams.push(`%${sku}%`);
        paramIndex++;
    }
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ` ORDER BY p.name ASC;`;
    const result = await pool.query(query, queryParams);
    return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        description: row.description,
        stock_quantity: row.stock_quantity,
        created_at: row.created_at,
        updated_at: row.updated_at,
        suppliers: row.preferred_supplier_id
            ? [
                {
                    id: row.preferred_supplier_id,
                    name: row.preferred_supplier_name,
                    cost: row.preferred_supplier_cost,
                    supplier_count: row.supplier_count,
                },
            ]
            : [],
    }));
};
