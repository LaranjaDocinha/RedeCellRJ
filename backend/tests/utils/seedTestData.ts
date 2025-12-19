import { PoolClient } from 'pg';
import { getPool } from '../../src/db';
import { v4 as uuidv4 } from 'uuid';
import pg from 'pg';

type Client = PoolClient | pg.Pool;

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
      return null; // Retorna explicitamente null se não encontrado
  }
  return res.rows[0].id; // Retorna apenas o ID como string
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
  console.log(
    `[seedProductVariation] Seeding variation ${variationId} for product ${productId} in branch ${branchId}`,
  );
  return variationId;
}

export async function seedProduct(
  branchId: number,
  client: Client = getPool(),
) {
  const productName = `Test Product ${uuidv4()}`;
  // Removed category_id as it does not exist in the current schema
  const productRes = await client.query(
    'INSERT INTO products (name, description, branch_id, sku) VALUES ($1, $2, $3, $4) RETURNING id',
    [productName, 'Description', branchId, `PROD-${uuidv4()}`],
  );
  const productId = productRes.rows[0].id;
  const variationId: number = await seedProductVariation(productId, branchId, client);
  return { productId, variationId };
}

export async function seedSale(
  client: Client,
  userId: string,
  customerId: string | null,
  saleDate: string,
  totalAmount: number,
  items: Array<{
    productId: number;
    variationId: number | null;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    totalPrice?: number;
  }>,
  payments: Array<{ method: string; amount: number; transactionDetails?: any }> = []
) {
  const saleRes = await client.query(
    'INSERT INTO sales (customer_id, user_id, total_amount, sale_date) VALUES ($1, $2, $3, $4) RETURNING id',
    [customerId, userId, totalAmount, saleDate],
  );
  const saleId = saleRes.rows[0].id;

  for (const item of items) {
    const totalPrice = item.totalPrice ?? (item.quantity * item.unitPrice);
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
      [saleId, payment.method, payment.amount, payment.transactionDetails || null],
    );
  }

  return saleId;
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
