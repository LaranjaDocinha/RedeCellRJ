const { faker } = require('@faker-js/faker');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seedDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Starting database seeding...');

    // Desabilitar verificações de chave estrangeira
    await client.query(`SET session_replication_role = 'replica';`);

    // Limpar tabelas
    console.log('Truncating tables...');
    await client.query('TRUNCATE TABLE users, customers, suppliers, categories, products, product_variations, sales, sale_items, repairs, repair_parts, stock_history, cash_sessions, accounts_payable, accounts_receivable, cash_drawer_closings, cash_drawer_closing_details, product_suggestions, notifications, payment_methods RESTART IDENTITY CASCADE;');

    // Reabilitar verificações de chave estrangeira
    await client.query(`SET session_replication_role = 'origin';`);

    // 1. Usuários
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const users = [];

    // Create admin user explicitly
    const adminUser = {
      name: 'Admin User',
      email: 'admin@pdv.com',
      password_hash: hashedPassword,
      role: 'admin',
      is_active: true,
      profile_image_url: faker.image.avatar(),
    };
    const { rows: adminRows } = await client.query(
      'INSERT INTO users (name, email, password_hash, role, is_active, profile_image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [adminUser.name, adminUser.email, adminUser.password_hash, adminUser.role, adminUser.is_active, adminUser.profile_image_url]
    );
    users.push({ id: adminRows[0].id, ...adminUser });

    // Generate other random users (e.g., 4 more sellers)
    for (let i = 0; i < 4; i++) { // Changed loop count from 5 to 4 as one user is already added
      const user = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password_hash: hashedPassword, // Using the same hashed password for simplicity, or generate new ones
        role: 'seller', // All these will be sellers
        is_active: true,
        profile_image_url: faker.image.avatar(),
      };
      const { rows } = await client.query(
        'INSERT INTO users (name, email, password_hash, role, is_active, profile_image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [user.name, user.email, user.password_hash, user.role, user.is_active, user.profile_image_url]
      );
      users.push({ id: rows[0].id, ...user });
    }
    console.log(`Seeded ${users.length} users.`);

    // 2. Clientes
    console.log('Seeding customers...');
    const customers = [];
    for (let i = 0; i < 20; i++) {
      const customer = {
        name: faker.person.fullName(),
        phone: faker.phone.number('## #####-####'),
        email: faker.internet.email(),
        address: faker.location.streetAddress(true),
      };
      const { rows } = await client.query(
        'INSERT INTO customers (name, phone, email, address) VALUES ($1, $2, $3, $4) RETURNING id',
        [customer.name, customer.phone, customer.email, customer.address]
      );
      customers.push({ id: rows[0].id, ...customer });
    }
    console.log(`Seeded ${customers.length} customers.`);

    // 3. Fornecedores
    console.log('Seeding suppliers...');
    const suppliers = [];
    for (let i = 0; i < 10; i++) {
      const supplier = {
        name: faker.company.name(),
        contact_person: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number('## #####-####'),
        address: faker.location.streetAddress(true),
      };
      const { rows } = await client.query(
        'INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [supplier.name, supplier.contact_person, supplier.email, supplier.phone, supplier.address]
      );
      suppliers.push({ id: rows[0].id, ...supplier });
    }
    console.log(`Seeded ${suppliers.length} suppliers.`);

    // 4. Categorias
    console.log('Seeding categories...');
    const categories = [];
    const categoryNames = ['Celulares', 'Acessórios', 'Informática', 'Serviços', 'Eletrônicos'];
    for (const name of categoryNames) {
      const { rows } = await client.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
        [name, faker.lorem.sentence()]
      );
      categories.push({ id: rows[0].id, name });
    }
    console.log(`Seeded ${categories.length} categories.`);

    // 5. Produtos e Variações
    console.log('Seeding products and variations...');
    const products = [];
    const productVariations = [];
    for (let i = 0; i < 30; i++) {
      const category = faker.helpers.arrayElement(categories);
      const product = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        category_id: category.id,
        product_type: faker.helpers.arrayElement(['physical', 'service']),
      };
      const { rows: productRows } = await client.query(
        'INSERT INTO products (name, description, category_id, product_type) VALUES ($1, $2, $3, $4) RETURNING id',
        [product.name, product.description, product.category_id, product.product_type]
      );
      products.push({ id: productRows[0].id, ...product });

      // Variações para cada produto
      const numVariations = faker.number.int({ min: 1, max: 3 });
      const usedColors = new Set(); // To store unique colors for this product
      for (let j = 0; j < numVariations; j++) {
        let uniqueColor = faker.color.human();
        // Ensure unique color for this product
        while (usedColors.has(uniqueColor)) {
          uniqueColor = faker.color.human();
        }
        usedColors.add(uniqueColor);

        const variation = {
          product_id: productRows[0].id,
          color: uniqueColor,
          price: faker.commerce.price({ min: 50, max: 2000, dec: 2 }),
          cost_price: faker.commerce.price({ min: 20, max: 1000, dec: 2 }),
          stock_quantity: faker.number.int({ min: 0, max: 100 }),
          barcode: faker.string.uuid(),
          status: faker.helpers.arrayElement(['active', 'inactive']),
          alert_threshold: faker.number.int({ min: 1, max: 10 }),
          image_url: null,
        };
        const { rows: variationRows } = await client.query(
          'INSERT INTO product_variations (product_id, color, price, cost_price, stock_quantity, barcode, status, alert_threshold, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
          [variation.product_id, variation.color, variation.price, variation.cost_price, variation.stock_quantity, variation.barcode, variation.status, variation.alert_threshold, variation.image_url]
        );
        productVariations.push({ id: variationRows[0].id, ...variation });
      }
    }
    console.log(`Seeded ${products.length} products and ${productVariations.length} variations.`);

    // 6. Vendas e Itens de Venda
    console.log('Seeding sales and sale items...');
    const sales = [];
    for (let i = 0; i < 50; i++) {
      const customer = faker.helpers.arrayElement(customers);
      const user = faker.helpers.arrayElement(users);
      const saleDate = faker.date.recent({ days: 90 });
      let subtotal = 0;
      const saleItems = [];
      const numItems = faker.number.int({ min: 1, max: 5 });

      for (let j = 0; j < numItems; j++) {
        const variation = faker.helpers.arrayElement(productVariations);
        const quantity = faker.number.int({ min: 1, max: 3 });
        const unitPrice = parseFloat(variation.price);
        const itemTotal = unitPrice * quantity;
        subtotal += itemTotal;
        saleItems.push({
          variation_id: variation.id,
          quantity,
          unit_price: unitPrice,
          discount_type: null,
          discount_value: 0,
        });
      }

      const totalAmount = subtotal; // Simplificado, sem descontos complexos

      const sale = {
        customer_id: customer.id,
        user_id: user.id,
        sale_date: saleDate,
        subtotal: subtotal,
        discount_type: null,
        discount_value: 0,
        total_amount: totalAmount,
        notes: faker.lorem.sentence(),
        sale_type: 'sale',
        original_sale_id: null,
      };
      const { rows: saleRows } = await client.query(
        'INSERT INTO sales (customer_id, user_id, sale_date, subtotal, discount_type, discount_value, total_amount, notes, sale_type, original_sale_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
        [sale.customer_id, sale.user_id, sale.sale_date, sale.subtotal, sale.discount_type, sale.discount_value, sale.total_amount, sale.notes, sale.sale_type, sale.original_sale_id]
      );
      sales.push({ id: saleRows[0].id, ...sale });

      for (const item of saleItems) {
        await client.query(
          'INSERT INTO sale_items (sale_id, variation_id, quantity, unit_price, discount_type, discount_value) VALUES ($1, $2, $3, $4, $5, $6)',
          [saleRows[0].id, item.variation_id, item.quantity, item.unit_price, item.discount_type, item.discount_value]
        );
      }
    }
    console.log(`Seeded ${sales.length} sales.`);

    // 7. Reparos
    console.log('Seeding repairs...');
    const repairs = [];
    for (let i = 0; i < 15; i++) {
      const customer = faker.helpers.arrayElement(customers);
      const user = faker.helpers.arrayElement(users);
      const repair = {
        customer_id: customer.id,
        user_id: user.id,
        device_type: faker.commerce.productAdjective() + ' ' + faker.commerce.product(),
        brand: faker.company.name(),
        model: faker.commerce.productMaterial(),
        imei_serial: faker.string.uuid(),
        problem_description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(['Orçamento pendente', 'Em andamento', 'Aguardando peça', 'Pronto para retirada', 'Concluído', 'Cancelado']),
        service_cost: faker.commerce.price({ min: 50, max: 500, dec: 2 }),
        parts_cost: faker.commerce.price({ min: 0, max: 300, dec: 2 }),
        final_cost: faker.commerce.price({ min: 100, max: 800, dec: 2 }),
        priority: faker.helpers.arrayElement(['Baixa', 'Normal', 'Alta']),
        tags: faker.helpers.arrayElements(['tela', 'bateria', 'software', 'água'], { min: 0, max: 3 }),
      };
      const { rows } = await client.query(
        'INSERT INTO repairs (customer_id, user_id, device_type, brand, model, imei_serial, problem_description, status, service_cost, parts_cost, final_cost, priority, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id',
        [repair.customer_id, repair.user_id, repair.device_type, repair.brand, repair.model, repair.imei_serial, repair.problem_description, repair.status, repair.service_cost, repair.parts_cost, repair.final_cost, repair.priority, repair.tags]
      );
      repairs.push({ id: rows[0].id, ...repair });
    }
    console.log(`Seeded ${repairs.length} repairs.`);

    // 8. Contas a Pagar
    console.log('Seeding accounts_payable...');
    const payables = [];
    for (let i = 0; i < 25; i++) {
      const payable = {
        description: faker.finance.transactionDescription(),
        amount: faker.commerce.price({ min: 100, max: 1000, dec: 2 }),
        due_date: faker.date.future({ years: 1 }),
        status: faker.helpers.arrayElement(['pending', 'paid', 'overdue']),
      };
      const { rows } = await client.query(
        'INSERT INTO accounts_payable (description, amount, due_date, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [payable.description, payable.amount, payable.due_date, payable.status]
      );
      payables.push({ id: rows[0].id, ...payable });
    }
    console.log(`Seeded ${payables.length} accounts payable.`);

    // 9. Contas a Receber
    console.log('Seeding accounts_receivable...');
    const receivables = [];
    for (let i = 0; i < 25; i++) {
      const receivable = {
        description: faker.finance.transactionDescription(),
        amount: faker.commerce.price({ min: 50, max: 500, dec: 2 }),
        due_date: faker.date.future({ years: 1 }),
        status: faker.helpers.arrayElement(['pending', 'received', 'overdue']),
      };
      const { rows } = await client.query(
        'INSERT INTO accounts_receivable (description, amount, due_date, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [receivable.description, receivable.amount, receivable.due_date, receivable.status]
      );
      receivables.push({ id: rows[0].id, ...receivable });
    }
    console.log(`Seeded ${receivables.length} accounts receivable.`);

    await client.query('COMMIT');
    console.log('Database seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to seed database:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedDatabase().catch(err => {
  console.error('An unexpected error occurred during seeding:', err);
  process.exit(1);
});