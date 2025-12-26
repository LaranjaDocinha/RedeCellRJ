import pg from 'pg';
import { faker } from '@faker-js/faker';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pdv_web',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// ========== RBAC Configuration ==========/
const ALL_ACTIONS = ['create', 'read', 'update', 'delete', 'manage'] as const;
const SUBJECTS = ['Audit', 'Branch', 'Category', 'Coupon', 'Customer', 'Dashboard', 'Discount', 'Inventory', 'KanbanTask', 'Loyalty', 'LoyaltyTier', 'Order', 'Payment', 'Permission', 'Product', 'ProductKit', 'PurchaseOrder', 'Report', 'Return', 'Review', 'Role', 'Sale', 'Search', 'Settings', 'Supplier', 'Tag', 'Upload', 'User', 'UserDashboard', 'Lead', 'LeadActivity'] as const;

type Action = typeof ALL_ACTIONS[number];
type Subject = typeof SUBJECTS[number];

const permissions: { action: Action; subject: Subject }[] = SUBJECTS.flatMap(subject =>
  ALL_ACTIONS.map(action => ({ action, subject }))
);

const roles = {
  admin: {
    name: 'admin',
    permissions: permissions, // Admin gets all permissions
  },
  manager: {
    name: 'manager',
    permissions: permissions.filter(p => 
      // Managers can do everything except delete users
      !(p.subject === 'User' && p.action === 'delete')
    ),
  },
  user: {
    name: 'user', // Represents a standard employee/salesperson
    permissions: [
      { action: 'read', subject: 'Product' },
      { action: 'create', subject: 'Order' },
      { action: 'read', subject: 'Order' },
      { action: 'read', subject: 'KanbanTask' },
      { action: 'update', subject: 'KanbanTask' }, // Can update their own tasks
    ],
  },
};

async function seedRbac(client: pg.PoolClient) {
  console.log('Seeding RBAC...');

  const permissionIds: { [key: string]: number } = {};
  for (const p of permissions) {
    const res = await client.query(
      'INSERT INTO permissions (action, subject) VALUES ($1, $2) ON CONFLICT (action, subject) DO UPDATE SET subject = EXCLUDED.subject RETURNING id',
      [p.action, p.subject]
    );
    permissionIds[`${p.action}:${p.subject}`] = res.rows[0].id;
  }

  const roleIds: { [key: string]: number } = {};
  for (const roleKey in roles) {
    const role = roles[roleKey as keyof typeof roles];
    const res = await client.query(
      'INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
      [role.name]
    );
    roleIds[role.name] = res.rows[0].id;
  }

  for (const roleKey in roles) {
    const role = roles[roleKey as keyof typeof roles];
    const roleId = roleIds[role.name];
    for (const p of role.permissions) {
      const permissionId = permissionIds[`${p.action}:${p.subject}`];
      await client.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [roleId, permissionId]
      );
    }
  }
  console.log('RBAC seeding complete.');
  return roleIds;
}

async function seedUsers(client: pg.PoolClient, roleIds: { [key: string]: number }, numberOfUsers: number) {
  console.log(`Seeding ${numberOfUsers} users...`);
  const saltRounds = 10;

  const adminEmail = 'admin@pdv.com';
  const adminPassword = 'admin123';
  const adminPasswordHash = await bcrypt.hash(adminPassword, saltRounds);
  const adminRoleName = 'admin';
  const adminRoleId = roleIds[adminRoleName];

  const adminUserRes = await client.query(
    `INSERT INTO users (name, email, password_hash) 
     VALUES ($1, $2, $3) 
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
     RETURNING id`,
    [ 'Admin User', adminEmail, adminPasswordHash ]
  );

  if (adminUserRes.rows[0]) {
    const adminUserId = adminUserRes.rows[0].id;
    await client.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [adminUserId, adminRoleId]
    );
  }

  for (let i = 0; i < numberOfUsers; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const passwordHash = await bcrypt.hash('password123', saltRounds);
    const roleName = faker.helpers.arrayElement(['user', 'manager', 'admin']);
    const roleId = roleIds[roleName];

    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING RETURNING id`,
      [ `${firstName} ${lastName}`, email, passwordHash ]
    );

    if (userRes.rows[0]) {
      await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userRes.rows[0].id, roleId]);
    }
  }
  console.log('User seeding complete.');
}

// ========== MAIN SEEDING FUNCTION ========== 
export async function runAllSeeds() {
  const client = await pool.connect();
  console.log('Starting massive database seeding...');
  try {
    await client.query('BEGIN');

    const roleIds = await seedRbac(client);
    await seedUsers(client, roleIds, 10);

    // 1. Branches
    const branchRes = await client.query(`
      INSERT INTO branches (name, address, phone) 
      VALUES ('Matriz Redecell', 'Av. Central, 100', '21999999999') 
      ON CONFLICT (name) DO UPDATE SET address = EXCLUDED.address, phone = EXCLUDED.phone
      RETURNING id
    `);
    const branchId = branchRes.rows[0].id;

    // 2. Categories
    const categories = ['Smartphones', 'Carregadores', 'Cabos', 'Áudio', 'Acessórios', 'Películas'];
    const categoryIds: { [key: string]: number } = {};
    for (const cat of categories) {
        const res = await client.query(`
          INSERT INTO categories (name) 
          VALUES ($1) 
          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `, [cat]);
        categoryIds[cat] = res.rows[0].id;
    }

    // 3. Suppliers
    const supplierRes = await client.query(`
      INSERT INTO suppliers (name, contact_info) 
      VALUES ('Distribuidora Tech', 'contato@tech.com') 
      ON CONFLICT (name) DO UPDATE SET contact_info = EXCLUDED.contact_info
      RETURNING id
    `);
    const supplierId = supplierRes.rows[0].id;

    // 4. Detailed Product List (~50 items)
    const productsData = [
        // Smartphones
        { name: 'iPhone 15 Pro', cat: 'Smartphones', sku: 'IP15P', price: 7500, cost: 6200, variations: ['Natural Titanium', 'Black Titanium'] },
        { name: 'iPhone 14', cat: 'Smartphones', sku: 'IP14', price: 4500, cost: 3800, variations: ['Estelar', 'Meia-noite', 'Azul'] },
        { name: 'Samsung S23 Ultra', cat: 'Smartphones', sku: 'S23U', price: 6200, cost: 5100, variations: ['Verde', 'Preto', 'Creme'] },
        { name: 'Redmi Note 12', cat: 'Smartphones', sku: 'RN12', price: 1200, cost: 950, variations: ['Cinza', 'Azul'] },
        
        // Carregadores
        { name: 'Carregador iPhone 20W USB-C', cat: 'Carregadores', sku: 'CHAR-AP-20W', price: 199, cost: 45, variations: ['Branco'] },
        { name: 'Carregador Samsung 25W', cat: 'Carregadores', sku: 'CHAR-SAM-25W', price: 149, cost: 35, variations: ['Preto'] },
        { name: 'Carregador Veicular Turbo', cat: 'Carregadores', sku: 'CHAR-CAR-TURBO', price: 89, cost: 22, variations: ['Preto', 'Prata'] },
        { name: 'Carregador Magnético Magsafe', cat: 'Carregadores', sku: 'CHAR-MAG', price: 299, cost: 85, variations: ['Branco'] },
        { name: 'Fonte 18W Xiaomi', cat: 'Carregadores', sku: 'CHAR-XIA-18W', price: 99, cost: 28, variations: ['Branco'] },
        { name: 'Kit Carregador + Cabo Lightning', cat: 'Carregadores', sku: 'KIT-LIG', price: 159, cost: 40, variations: ['Padrão'] },
        { name: 'Power Bank 10000mAh', cat: 'Carregadores', sku: 'PB-10K', price: 189, cost: 65, variations: ['Preto', 'Branco'] },
        { name: 'Power Bank 20000mAh Turbo', cat: 'Carregadores', sku: 'PB-20K', price: 289, cost: 110, variations: ['Preto'] },

        // Cabos
        { name: 'Cabo USB-C para Lightning 1m', cat: 'Cabos', sku: 'CB-CL-1M', price: 149, cost: 25, variations: ['Original', 'Premium Braided'] },
        { name: 'Cabo USB-C para USB-C 2m', cat: 'Cabos', sku: 'CB-CC-2M', price: 129, cost: 20, variations: ['Branco'] },
        { name: 'Cabo Micro USB Reforçado', cat: 'Cabos', sku: 'CB-MICRO', price: 49, cost: 8, variations: ['Preto', 'Cinza'] },
        { name: 'Cabo HDMI 4K 2m', cat: 'Cabos', sku: 'CB-HDMI', price: 79, cost: 18, variations: ['Preto'] },
        { name: 'Cabo 3 em 1 (Type-C/Lig/Micro)', cat: 'Cabos', sku: 'CB-3IN1', price: 69, cost: 15, variations: ['Preto', 'Vermelho'] },
        { name: 'Cabo Type-C Turbo 3A', cat: 'Cabos', sku: 'CB-TC-3A', price: 59, cost: 12, variations: ['Branco', 'Preto'] },

        // Áudio
        { name: 'AirPods Pro (2ª Geração)', cat: 'Áudio', sku: 'AUD-APP2', price: 2200, cost: 1600, variations: ['Branco'] },
        { name: 'Galaxy Buds 2 Pro', cat: 'Áudio', sku: 'AUD-GB2P', price: 1100, cost: 850, variations: ['Grafite', 'Branco'] },
        { name: 'Fone de Ouvido P2 Básico', cat: 'Áudio', sku: 'AUD-P2', price: 39, cost: 5, variations: ['Branco', 'Preto'] },
        { name: 'Headset Gamer RGB', cat: 'Áudio', sku: 'AUD-HS-GAMER', price: 249, cost: 95, variations: ['Preto'] },
        { name: 'Caixa de Som Bluetooth IPX7', cat: 'Áudio', sku: 'AUD-BT-SPK', price: 349, cost: 120, variations: ['Azul', 'Preto', 'Camuflado'] },
        { name: 'Fone Bluetooth Neckband', cat: 'Áudio', sku: 'AUD-NECK', price: 129, cost: 45, variations: ['Preto'] },
        { name: 'Fone Esportivo sem fio', cat: 'Áudio', sku: 'AUD-SPORT', price: 189, cost: 55, variations: ['Verde', 'Preto'] },

        // Películas
        { name: 'Película de Vidro iPhone 15', cat: 'Películas', sku: 'PEL-IP15-VID', price: 49, cost: 4, variations: ['Transparente'] },
        { name: 'Película Privacidade iPhone 14', cat: 'Películas', sku: 'PEL-IP14-PRIV', price: 79, cost: 8, variations: ['Fumê'] },
        { name: 'Película Cerâmica S23', cat: 'Películas', sku: 'PEL-S23-CER', price: 59, cost: 6, variations: ['Fosca'] },
        { name: 'Película de Vidro 3D Universal', cat: 'Películas', sku: 'PEL-UNIV-3D', price: 39, cost: 3, variations: ['Transparente'] },
        { name: 'Película de Lente de Câmera', cat: 'Películas', sku: 'PEL-LENS', price: 29, cost: 5, variations: ['Vidro Temperado'] },
        { name: 'Película de Gel Traseira', cat: 'Películas', sku: 'PEL-GEL-BACK', price: 45, cost: 7, variations: ['Carbono', 'Transparente'] },

        // Acessórios
        { name: 'Capa Silicone MagSafe iPhone', cat: 'Acessórios', sku: 'ACC-CAPA-MAG', price: 149, cost: 30, variations: ['Azul', 'Rosa', 'Preto', 'Verde'] },
        { name: 'Capa Anti-Impacto Transparente', cat: 'Acessórios', sku: 'ACC-CAPA-SHOCK', price: 69, cost: 12, variations: ['Transparente'] },
        { name: 'Suporte Celular de Mesa', cat: 'Acessórios', sku: 'ACC-HOLDER-DESK', price: 49, cost: 15, variations: ['Preto', 'Branco'] },
        { name: 'Suporte Celular Veicular Magnético', cat: 'Acessórios', sku: 'ACC-HOLDER-CAR', price: 59, cost: 18, variations: ['Preto'] },
        { name: 'Anel de Suporte (PopSocket)', cat: 'Acessórios', sku: 'ACC-POP', price: 25, cost: 3, variations: ['Diversos'] },
        { name: 'Cartão de Memória 64GB Class 10', cat: 'Acessórios', sku: 'ACC-SD-64', price: 89, cost: 35, variations: ['Sandisk'] },
        { name: 'Adaptador USB-C para P2', cat: 'Acessórios', sku: 'ACC-ADAP-P2', price: 49, cost: 10, variations: ['Branco'] },
        { name: 'Kit Limpeza de Tela', cat: 'Acessórios', sku: 'ACC-CLEAN', price: 29, cost: 8, variations: ['Spray 100ml'] },
        { name: 'Pau de Selfie Bluetooth', cat: 'Acessórios', sku: 'ACC-SELFIE', price: 99, cost: 32, variations: ['Preto'] },
        { name: 'Tripé Flexível Profissional', cat: 'Acessórios', sku: 'ACC-TRIPOD', price: 129, cost: 40, variations: ['Preto'] },
        { name: 'Organizador de Cabos', cat: 'Acessórios', sku: 'ACC-ORG', price: 19, cost: 4, variations: ['Kit 5 unidades'] },
        { name: 'Braçadeira para Corrida', cat: 'Acessórios', sku: 'ACC-RUN', price: 59, cost: 15, variations: ['Preto', 'Cinza'] },
        { name: 'Controle Bluetooth para Celular', cat: 'Acessórios', sku: 'ACC-GAMEPAD', price: 199, cost: 75, variations: ['Preto'] },
        { name: 'Caneta Touch Screen Universal', cat: 'Acessórios', sku: 'ACC-PEN', price: 39, cost: 10, variations: ['Preto', 'Branco'] },
        { name: 'Mini Ventilador USB-C', cat: 'Acessórios', sku: 'ACC-FAN', price: 29, cost: 9, variations: ['Azul', 'Rosa'] },
        { name: 'Lâmpada LED Selfie (Ring Light)', cat: 'Acessórios', sku: 'ACC-RING', price: 89, cost: 35, variations: ['Pequeno'] },
        { name: 'Bolsa Impermeável para Praia', cat: 'Acessórios', sku: 'ACC-BAG-WATER', price: 39, cost: 10, variations: ['Transparente'] },
        { name: 'Adaptador OTG USB-C', cat: 'Acessórios', sku: 'ACC-OTG', price: 29, cost: 6, variations: ['Prata'] },
        { name: 'Carregador Portátil MagSafe Apple', cat: 'Acessórios', sku: 'ACC-MAG-PB', price: 899, cost: 450, variations: ['Branco'] }
    ];

    for (const p of productsData) {
        const prodRes = await client.query(`
            INSERT INTO products (name, branch_id, category_id, sku, is_serialized, product_type) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            ON CONFLICT (sku) DO UPDATE SET 
              name = EXCLUDED.name, 
              category_id = EXCLUDED.category_id,
              product_type = EXCLUDED.product_type
            RETURNING id
        `, [p.name, branchId, categoryIds[p.cat], p.sku, p.cat === 'Smartphones', p.cat === 'Serviço' ? 'Serviço' : 'Produto']);
        const productId = prodRes.rows[0].id;

        for (const vName of p.variations) {
            const vSku = `${p.sku}-${vName.substring(0,3).toUpperCase()}`;
            const varRes = await client.query(`
                INSERT INTO product_variations (product_id, name, sku, price, cost_price, low_stock_threshold) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                ON CONFLICT (sku) DO UPDATE SET 
                  price = EXCLUDED.price, 
                  cost_price = EXCLUDED.cost_price,
                  low_stock_threshold = EXCLUDED.low_stock_threshold
                RETURNING id
            `, [productId, vName, vSku, p.price, p.cost, 5]);
            const varId = varRes.rows[0].id;

            await client.query(`
                INSERT INTO branch_product_variations_stock (branch_id, product_variation_id, stock_quantity, min_stock_level) 
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (branch_id, product_variation_id) DO UPDATE SET 
                  stock_quantity = EXCLUDED.stock_quantity,
                  min_stock_level = EXCLUDED.min_stock_level
            `, [branchId, varId, faker.number.int({ min: 5, max: 50 }), 2]);
            
            await client.query(`
                INSERT INTO product_stock (product_variation_id, branch_id, quantity) 
                VALUES ($1, $2, $3)
                ON CONFLICT (product_variation_id, branch_id) DO UPDATE SET 
                  quantity = EXCLUDED.quantity
            `, [varId, branchId, 10]);
        }
    }
    console.log(`Successfully seeded ${productsData.length} products.`);

    // 5. Loyalty Tiers
    const tiers = [
      { name: 'Bronze', min_points: 0, description: 'Nível inicial', benefits: { discount: 5 } },
      { name: 'Prata', min_points: 1000, description: 'Nível intermediário', benefits: { discount: 10, free_shipping: true } },
      { name: 'Ouro', min_points: 5000, description: 'Nível VIP', benefits: { discount: 15, priority_support: true } }
    ];

    for (const tier of tiers) {
      await client.query(`
        INSERT INTO loyalty_tiers (name, min_points, description, benefits) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO UPDATE SET 
          min_points = EXCLUDED.min_points, 
          description = EXCLUDED.description, 
          benefits = EXCLUDED.benefits
      `, [tier.name, tier.min_points, tier.description, JSON.stringify(tier.benefits)]);
    }

    await client.query('COMMIT');
    console.log('Seeding finished successfully! 🚀');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during seeding:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runAllSeeds();