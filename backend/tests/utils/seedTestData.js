import { getPool } from '../../src/db/index.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export async function seedBranch(client = getPool()) {
    // Aceitar client como argumento
    const branchName = `Test Branch ${uuidv4()}`;
    const res = await client.query('INSERT INTO branches (name) VALUES ($1) RETURNING id', [
        branchName,
    ]);
    return res.rows[0].id;
}

export async function seedCustomer(client = getPool()) {
    const customerName = `Test Customer ${uuidv4()}`;
    const customerEmail = `${uuidv4()}@test.com`;
    const res = await client.query('INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id', [customerName, customerEmail]);
    return res.rows[0].id;
}
export async function getAdminUserId(client = getPool()) {
    const res = await client.query("SELECT id FROM users WHERE email = 'admin@pdv.com'");
    if (res.rows.length === 0) {
        // Fallback or seed if not exists, but tests usually rely on global setup
        return null; 
    }
    return res.rows[0];
}
export async function seedStock(client = getPool(), productVariationId, branchId, quantity) {
    await client.query('INSERT INTO branch_product_variations_stock (product_variation_id, branch_id, stock_quantity) VALUES ($1, $2, $3) ON CONFLICT (product_variation_id, branch_id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity', [productVariationId, branchId, quantity]);
}

export async function seedProductVariation(productId, branchId, client = getPool()) {
    const sku = `SKU-${uuidv4()}`;
    const res = await client.query('INSERT INTO product_variations (product_id, sku, price, cost_price) VALUES ($1, $2, $3, $4) RETURNING id', [productId, sku, 100, 50]);
    const variationId = res.rows[0].id;
    await seedStock(client, variationId, branchId, 10);
    console.log(`[seedProductVariation] Seeding variation ${variationId} for product ${productId} in branch ${branchId}`);
    return variationId;
}
export async function seedProduct(branchId, client = getPool()) {
    const productName = `Test Product ${uuidv4()}`;
    const productRes = await client.query('INSERT INTO products (name, description, branch_id) VALUES ($1, $2, $3) RETURNING id', [productName, 'Description', branchId]);
    const productId = productRes.rows[0].id;
    const variationId = await seedProductVariation(productId, branchId, client);
    return { productId, variationId };
}
export async function seedSale(client = getPool(), userId = null, customerId = null, saleDate = new Date(), totalAmount = 100.00, items = [], payments = []) {
    if (!userId) {
        const adminUser = await getAdminUserId(client);
        userId = adminUser ? adminUser.id : await seedUser(client, { name: 'Temp Admin', email: `admin-${uuidv4()}@test.com`, password: 'password' });
    }
    if (!customerId) {
        customerId = await seedCustomer(client);
    }
    
    // If no items provided, seed a default product
    let createdProductId = null;
    let createdVariationId = null;
    let createdBranchId = null;

    if (!items || items.length === 0) {
        createdBranchId = await seedBranch(client);
        const productData = await seedProduct(createdBranchId, client);
        createdProductId = productData.productId;
        createdVariationId = productData.variationId;
        
        items = [{
            productId: createdProductId,
            variationId: createdVariationId,
            quantity: 1,
            unitPrice: 100.00,
            costPrice: 50.00
        }];
    }

    const saleRes = await client.query('INSERT INTO sales (customer_id, user_id, total_amount, sale_date) VALUES ($1, $2, $3, $4) RETURNING id', [customerId, userId, totalAmount, saleDate]);
    const saleId = saleRes.rows[0].id;
    
    for (const item of items) {
        await client.query('INSERT INTO sale_items (sale_id, product_id, variation_id, quantity, unit_price, cost_price, total_price) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
            saleId,
            item.productId,
            item.variationId,
            item.quantity,
            item.unitPrice,
            item.costPrice,
            item.unitPrice * item.quantity // total_price
        ]);
    }
    
    // Return all IDs so test can use them (and clean them up)
    return { 
        saleId, 
        customerId, 
        userId, 
        branchId: createdBranchId, 
        productId: createdProductId, 
        variantId: createdVariationId 
    };
}

export async function cleanupSale(client = getPool(), saleId, customerId = null, productId = null, branchId = null) {
    if (saleId) await client.query('DELETE FROM sales WHERE id = $1', [saleId]);
    if (customerId) await cleanupCustomer(customerId, client);
    if (productId) await cleanupProduct(productId, client);
    if (branchId) await cleanupBranch(branchId, client);
}

export async function cleanupCustomer(customerId, client = getPool()) {
    await client.query('DELETE FROM customers WHERE id = $1', [customerId]);
}
export async function cleanupBranch(branchId, client = getPool()) {
    await client.query('DELETE FROM branches WHERE id = $1', [branchId]);
}

export async function cleanupProduct(productId, client = getPool()) {
    await client.query('DELETE FROM products WHERE id = $1', [productId]);
}

// Funções de seed para usuários, roles e permissões
export async function seedUser(client, userData) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const res = await client.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
    [userData.name, userData.email, hashedPassword]
  );
  return res.rows[0].id;
}

export async function cleanupUser(client, userId) {
  await client.query('DELETE FROM users WHERE id = $1', [userId]);
}

export async function seedRole(client, roleName) {
  // Tentar encontrar a role existente primeiro
  const existingRes = await client.query(
    'SELECT id FROM roles WHERE name = $1',
    [roleName]
  );
  if (existingRes.rows.length > 0) {
    return existingRes.rows[0].id;
  }

  // Se não existir, inserir
  const res = await client.query('INSERT INTO roles (name) VALUES ($1) RETURNING id', [roleName]);
  return res.rows[0].id;
}

export async function cleanupRole(client, roleId) {
  await client.query('DELETE FROM roles WHERE id = $1', [roleId]);
}

export async function seedPermission(client, action, subject) {
  // Tentar encontrar a permissão existente primeiro
  const existingRes = await client.query(
    'SELECT id FROM permissions WHERE action = $1 AND subject = $2',
    [action, subject]
  );
  if (existingRes.rows.length > 0) {
    return existingRes.rows[0].id;
  }

  // Se não existir, inserir
  const res = await client.query(
    'INSERT INTO permissions (action, subject) VALUES ($1, $2) RETURNING id',
    [action, subject]
  );
  return res.rows[0].id;
}

export async function cleanupPermission(client, permissionId) {
  await client.query('DELETE FROM permissions WHERE id = $1', [permissionId]);
}

export async function assignPermissionToRole(client, roleId, permissionId) {
  await client.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)', [
    roleId,
    permissionId,
  ]);
}

export async function assignRoleToUser(client, userId, roleId) {
  await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, roleId]);
}

export async function removePermissionFromRole(client, roleId, permissionId) {
  await client.query('DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2', [
    roleId,
    permissionId,
  ]);
}