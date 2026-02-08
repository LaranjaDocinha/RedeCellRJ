import { PoolClient } from 'pg';
import { getPool } from '../../src/db/index.js';
import { v4 as uuidv4 } from 'uuid';
import pg from 'pg';
import bcrypt from 'bcrypt';

type Client = PoolClient | pg.Pool;

export async function seedUser(client: Client, userData: any) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const res = await client.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
    [userData.name, userData.email, hashedPassword],
  );
  return res.rows[0].id;
}

export async function cleanupUser(client: Client, userId: string) {
  try {
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
  } catch (e) {}
}

export async function seedRole(client: Client, roleName: string) {
  const existingRes = await client.query('SELECT id FROM roles WHERE name = $1', [roleName]);
  if (existingRes.rows.length > 0) return existingRes.rows[0].id;
  const res = await client.query('INSERT INTO roles (name) VALUES ($1) RETURNING id', [roleName]);
  return res.rows[0].id;
}

export async function cleanupRole(client: Client, roleId: number) {
  try {
    await client.query('DELETE FROM roles WHERE id = $1', [roleId]);
  } catch (e) {}
}

export async function seedPermission(client: Client, action: string, subject: string) {
  const existingRes = await client.query(
    'SELECT id FROM permissions WHERE action = $1 AND subject = $2',
    [action, subject],
  );
  if (existingRes.rows.length > 0) return existingRes.rows[0].id;
  const res = await client.query(
    'INSERT INTO permissions (action, subject) VALUES ($1, $2) RETURNING id',
    [action, subject],
  );
  return res.rows[0].id;
}

export async function cleanupPermission(client: Client, permissionId: number) {
  try {
    await client.query('DELETE FROM permissions WHERE id = $1', [permissionId]);
  } catch (e) {}
}

export async function assignPermissionToRole(client: Client, roleId: number, permissionId: number) {
  try {
    await client.query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [roleId, permissionId],
    );
  } catch (e) {}
}

export async function assignRoleToUser(client: Client, userId: string, roleId: number) {
  try {
    await client.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, roleId],
    );
  } catch (e) {}
}

export async function removePermissionFromRole(
  client: Client,
  roleId: number,
  permissionId: number,
) {
  try {
    await client.query('DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2', [
      roleId,
      permissionId,
    ]);
  } catch (e) {}
}

export async function seedBranch(client: Client = getPool()) {
  const branchName = `Test Branch ${uuidv4()}`;
  const res = await client.query('INSERT INTO branches (name) VALUES ($1) RETURNING id', [
    branchName,
  ]);
  return res.rows[0].id;
}

export async function seedCustomer(client: Client = getPool()) {
  const customerName = `Test Customer ${uuidv4()}`;
  const customerEmail = `${uuidv4()}@test.com`;
  const res = await client.query(
    'INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id',
    [customerName, customerEmail],
  );
  return res.rows[0].id;
}

export async function getAdminUserId(client: Client = getPool()) {
  const res = await client.query("SELECT id FROM users WHERE email = 'admin@pdv.com'");
  if (res.rows.length === 0) {
    console.error('Admin user not found in the database. Check seeding process.');
    return null;
  }
  return res.rows[0].id;
}

export async function seedCategory(client: Client = getPool()) {
  const name = `Test Category ${uuidv4()}`;
  const res = await client.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [name]);
  return res.rows[0].id;
}

export async function seedProductVariation(
  productId: number,
  branchId: number,
  client: Client = getPool(),
): Promise<number> {
  const sku = `SKU-${uuidv4()}`;
  const res = await client.query(
    'INSERT INTO product_variations (product_id, sku, price, cost_price) VALUES ($1, $2, $3, $4) RETURNING id',
    [productId, sku, 100, 50],
  );
  const variationId = res.rows[0].id;
  await seedStock(client, variationId.toString(), branchId.toString(), 10);
  return variationId;
}

export async function seedProduct(
  branchId: number,
  client: Client = getPool(),
  categoryId?: number,
) {
  const productName = `Test Product ${uuidv4()}`;
  const productRes = await client.query(
    'INSERT INTO products (name, description, branch_id, sku, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [productName, 'Description', branchId, `PROD-${uuidv4()}`, categoryId || null],
  );
  const productId = productRes.rows[0].id;
  const variationId: number = await seedProductVariation(productId, branchId, client);
  return { productId, variationId };
}

export async function seedSale(params: {
  client: Client;
  userId: string;
  customerId: string | null;
  saleDate: Date;
  totalAmount: number;
  branchId?: number;
  items: Array<{
    productId: number;
    variationId: number | null;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    totalPrice?: number;
  }>;
  payments: Array<{ method: string; amount: number; transactionDetails?: any }>;
}) {
  const {
    client,
    userId,
    customerId,
    saleDate = new Date(),
    totalAmount,
    branchId,
    items,
    payments,
  } = params;
  const saleRes = await client.query(
    'INSERT INTO sales (customer_id, user_id, total_amount, sale_date, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [customerId, userId, totalAmount, saleDate, branchId || null],
  );
  const saleId = saleRes.rows[0].id;

  for (const item of items) {
    const totalPrice = item.totalPrice ?? item.quantity * item.unitPrice;
    await client.query(
      'INSERT INTO sale_items (sale_id, product_id, variation_id, quantity, unit_price, cost_price, total_price) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        saleId,
        item.productId,
        item.variationId,
        item.quantity,
        item.unitPrice,
        item.costPrice,
        totalPrice,
      ],
    );
  }

  for (const payment of payments) {
    await client.query(
      'INSERT INTO sale_payments (sale_id, payment_method, amount, transaction_details) VALUES ($1, $2, $3, $4)',
      [
        saleId,
        payment.method,
        payment.amount,
        payment.transactionDetails ? JSON.stringify(payment.transactionDetails) : null,
      ],
    );
  }

  return { saleId };
}

export async function cleanupSale(saleId: string, client: Client = getPool()) {
  await client.query('DELETE FROM sales WHERE id = $1', [saleId]);
}

export async function seedStock(
  client: Client = getPool(),
  productVariantId: string,
  branchId: string,
  quantity: number,
) {
  await client.query(
    'INSERT INTO branch_product_variations_stock (product_variation_id, branch_id, stock_quantity) VALUES ($1, $2, $3) ON CONFLICT (branch_id, product_variation_id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity',
    [productVariantId, branchId, quantity],
  );
}

export async function cleanupCustomer(customerId: string, client: Client = getPool()) {
  await client.query('DELETE FROM customers WHERE id = $1', [customerId]);
}

export async function cleanupBranch(branchId: string, client: Client = getPool()) {
  await client.query('DELETE FROM branches WHERE id = $1', [branchId]);
}

export async function cleanupProduct(productId: string, client: Client = getPool()) {
  await client.query('DELETE FROM products WHERE id = $1', [productId]);
}

export async function seedAdmin(client: Client = getPool()) {
  // This is handled by global setup, but if needed locally:
  const adminEmail = `admin-${uuidv4()}@pdv.com`;
  const res = await client.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', $1, 'hash', 'admin') RETURNING id",
    [adminEmail],
  );
  return { id: res.rows[0].id, email: adminEmail };
}
