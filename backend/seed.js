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

    

    // Reabilitar verificações de chave estrangeira
    await client.query(`SET session_replication_role = 'origin';`);

    // Inserir papéis padrão (seeding) - Garantir que existam antes de serem referenciados
    console.log('Seeding default roles...');
    await client.query("INSERT INTO roles (name, description) VALUES ('admin', 'Administrador do sistema com acesso total.') ON CONFLICT (name) DO NOTHING;");
    await client.query("INSERT INTO roles (name, description) VALUES ('technician', 'Técnico responsável por reparos e gestão de OS.') ON CONFLICT (name) DO NOTHING;");
    await client.query("INSERT INTO roles (name, description) VALUES ('seller', 'Vendedor com acesso ao PDV e gestão de clientes.') ON CONFLICT (name) DO NOTHING;");
    console.log('Default roles seeded.');

    // Inserir métodos de pagamento padrão
    console.log('Seeding default payment methods...');
    await client.query("INSERT INTO payment_methods (name, is_active) VALUES ('Dinheiro', TRUE) ON CONFLICT (name) DO NOTHING;");
    await client.query("INSERT INTO payment_methods (name, is_active) VALUES ('Cartão de Crédito', TRUE) ON CONFLICT (name) DO NOTHING;");
    await client.query("INSERT INTO payment_methods (name, is_active) VALUES ('Cartão de Débito', TRUE) ON CONFLICT (name) DO NOTHING;");
    await client.query("INSERT INTO payment_methods (name, is_active) VALUES ('PIX', TRUE) ON CONFLICT (name) DO NOTHING;");
    console.log('Default payment methods seeded.');

    // 1. Usuários
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const users = [];

    // Fetch role IDs
    const adminRoleResult = await client.query("SELECT id FROM roles WHERE name = 'admin'");
    const adminRoleId = adminRoleResult.rows[0].id;
    const sellerRoleResult = await client.query("SELECT id FROM roles WHERE name = 'seller'");
    const sellerRoleId = sellerRoleResult.rows[0].id;
    const technicianRoleResult = await client.query("SELECT id FROM roles WHERE name = 'technician'"); // Fetch technician role ID
    const technicianRoleId = technicianRoleResult.rows[0].id;

    // Fetch the admin user created by schema_consolidated.sql
    const existingAdminUserResult = await client.query("SELECT id, name, email, role_id, is_active, profile_image_url, branch_id FROM users WHERE email = 'admin@pdv.com'");
    const adminUser = existingAdminUserResult.rows[0];
    users.push(adminUser); // Add the existing admin user to the users array

    // Generate other random users (e.g., 4 more sellers)
    for (let i = 0; i < 4; i++) {
      const user = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password_hash: hashedPassword,
        role_id: sellerRoleId,
        is_active: true,
        profile_image_url: faker.image.avatar(),
        branch_id: 1, // Assuming default branch_id is 1
      };
      const { rows } = await client.query(
        'INSERT INTO users (name, email, password_hash, role_id, is_active, profile_image_url, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [user.name, user.email, user.password_hash, user.role_id, user.is_active, user.profile_image_url, user.branch_id]
      );
      users.push({ id: rows[0].id, ...user });
    }
    console.log(`Seeded ${users.length} users.`);

    // Seed Technicians (separate table)
    console.log('Seeding technicians...');
    const technicians = [];
    for (let i = 0; i < 3; i++) { // Seed 3 technicians
      const technician = {
        name: faker.person.fullName(),
        phone: faker.phone.number('## #####-####'),
        email: faker.internet.email(),
      };
      const { rows } = await client.query(
        'INSERT INTO technicians (name, phone, email) VALUES ($1, $2, $3) RETURNING id',
        [technician.name, technician.phone, technician.email]
      );
      technicians.push({ id: rows[0].id, ...technician });
    }
    console.log(`Seeded ${technicians.length} technicians.`);

    // 2. Clientes
    console.log('Seeding customers...');
    const customers = [];
    for (let i = 0; i < 20; i++) {
      const customer = {
        name: faker.person.fullName(),
        phone: faker.phone.number('## #####-####'),
        email: faker.internet.email(),
        address: faker.location.streetAddress(true),
        branch_id: 1, // Assuming default branch_id is 1
      };
      const { rows } = await client.query(
        'INSERT INTO customers (name, phone, email, address, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [customer.name, customer.phone, customer.email, customer.address, customer.branch_id]
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
    const categoryNames = ['Celulares', 'Acessórios', 'Informática', 'Serviços', 'Eletrônicos'];
    for (const name of categoryNames) {
      await client.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [name, faker.lorem.sentence()]
      );
    }
    const categoriesResult = await client.query('SELECT id, name FROM categories WHERE name = ANY($1)', [categoryNames]);
    const categories = categoriesResult.rows;
    console.log(`Seeded or found ${categories.length} categories.`);

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
        branch_id: 1, // Assuming default branch_id is 1
      };
      const { rows: productRows } = await client.query(
        'INSERT INTO products (name, description, category_id, product_type, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [product.name, product.description, product.category_id, product.product_type, product.branch_id]
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
    // Fetch payment methods
    const paymentMethodsResult = await client.query('SELECT id, name FROM payment_methods');
    const paymentMethods = paymentMethodsResult.rows;
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
        branch_id: 1, // Assuming default branch_id is 1
      };
      const { rows: saleRows } = await client.query(
        'INSERT INTO sales (customer_id, user_id, sale_date, subtotal, discount_type, discount_value, total_amount, notes, sale_type, original_sale_id, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
        [sale.customer_id, sale.user_id, sale.sale_date, sale.subtotal, sale.discount_type, sale.discount_value, sale.total_amount, sale.notes, sale.sale_type, sale.original_sale_id, sale.branch_id]
      );
      sales.push({ id: saleRows[0].id, ...sale });

      for (const item of saleItems) {
        await client.query(
          'INSERT INTO sale_items (sale_id, variation_id, quantity, unit_price, discount_type, discount_value) VALUES ($1, $2, $3, $4, $5, $6)',
          [saleRows[0].id, item.variation_id, item.quantity, item.unit_price, item.discount_type, item.discount_value]
        );
      }

      // Seed Sale Payments
      let remainingAmount = totalAmount;
      while (remainingAmount > 0) {
        const paymentMethod = faker.helpers.arrayElement(paymentMethods);
        let paymentAmount;

        // If remaining amount is very small, just use it directly to avoid faker.number.float error
        if (remainingAmount < 0.01) { // Use a small threshold
          paymentAmount = remainingAmount;
        } else {
          paymentAmount = faker.number.float({ min: 0.01, max: remainingAmount, precision: 0.01 });
        }
        if (paymentAmount > remainingAmount) {
          paymentAmount = remainingAmount;
        }
        await client.query(
          'INSERT INTO sale_payments (sale_id, payment_method, amount) VALUES ($1, $2, $3)',
          [saleRows[0].id, paymentMethod.name, paymentAmount]
        );
        remainingAmount -= paymentAmount;
      }
    }
    console.log(`Seeded ${sales.length} sales.`);

    // 7. Reparos
    console.log('Seeding repairs...');
    const repairs = [];
    const repairStatuses = ['Orçamento pendente', 'Em andamento', 'Aguardando peça', 'Pronto para retirada', 'Concluído', 'Cancelado'];
    for (let i = 0; i < 50; i++) { // Increased repair count for more data
      const customer = faker.helpers.arrayElement(customers);
      const user = faker.helpers.arrayElement(users); // User who created the repair
      const technician = faker.helpers.arrayElement(technicians); // Assign a random technician
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
        technician_id: technician.id, // Assign technician
        branch_id: 1, // Assuming default branch_id is 1
      };
      const { rows: repairRows } = await client.query(
        'INSERT INTO repairs (customer_id, user_id, device_type, brand, model, imei_serial, problem_description, status, service_cost, parts_cost, final_cost, priority, tags, technician_id, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id',
        [repair.customer_id, repair.user_id, repair.device_type, repair.brand, repair.model, repair.imei_serial, repair.problem_description, repair.status, repair.service_cost, repair.parts_cost, repair.final_cost, repair.priority, repair.tags, repair.technician_id, repair.branch_id]
      );
      const newRepair = { id: repairRows[0].id, ...repair };
      repairs.push(newRepair);

      // Seed Repair Parts (if parts_cost > 0)
      if (newRepair.parts_cost > 0 && productVariations.length > 0) {
        const numParts = faker.number.int({ min: 1, max: 3 });
        for (let j = 0; j < numParts; j++) {
          const variation = faker.helpers.arrayElement(productVariations);
          const quantityUsed = faker.number.int({ min: 1, max: 2 });
          await client.query(
            'INSERT INTO repair_parts (repair_id, variation_id, quantity_used, unit_price_at_time) VALUES ($1, $2, $3, $4)',
            [newRepair.id, variation.id, quantityUsed, variation.price]
          );
        }
      }

      // Seed Repair History
      let currentStatus = 'Orçamento pendente';
      await client.query(
        'INSERT INTO repair_history (repair_id, user_id, status_from, status_to, notes) VALUES ($1, $2, $3, $4, $5)',
        [newRepair.id, user.id, null, currentStatus, 'Ordem de reparo criada.']
      );

      // Simulate status changes
      const statusIndex = repairStatuses.indexOf(newRepair.status);
      for (let j = 0; j < statusIndex; j++) {
        const nextStatus = repairStatuses[j + 1];
        await client.query(
          'INSERT INTO repair_history (repair_id, user_id, status_from, status_to, notes) VALUES ($1, $2, $3, $4, $5)',
          [newRepair.id, user.id, currentStatus, nextStatus, faker.lorem.sentence()]
        );
        currentStatus = nextStatus;
      }
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
        branch_id: 1, // Assuming default branch_id is 1
      };
      const { rows } = await client.query(
        'INSERT INTO accounts_payable (description, amount, due_date, status, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [payable.description, payable.amount, payable.due_date, payable.status, payable.branch_id]
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
        branch_id: 1, // Assuming default branch_id is 1
      };
      const { rows } = await client.query(
        'INSERT INTO accounts_receivable (description, amount, due_date, status, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [receivable.description, receivable.amount, receivable.due_date, receivable.status, receivable.branch_id]
      );
      receivables.push({ id: rows[0].id, ...receivable });
    }
    console.log(`Seeded ${receivables.length} accounts receivable.`);

    // 10. Despesas
    console.log('Seeding expenses...');
    const expenses = [];
    const expenseCategories = ['Aluguel', 'Salários', 'Marketing', 'Manutenção', 'Utilidades', 'Outros'];
    for (let i = 0; i < 30; i++) {
      const expense = {
        description: faker.lorem.sentence(),
        amount: faker.commerce.price({ min: 50, max: 1000, dec: 2 }),
        expense_date: faker.date.recent({ days: 180 }),
        category: faker.helpers.arrayElement(expenseCategories),
        branch_id: 1, // Assuming default branch_id is 1
      };
      const { rows } = await client.query(
        'INSERT INTO expenses (description, amount, expense_date, category, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [expense.description, expense.amount, expense.expense_date, expense.category, expense.branch_id]
      );
      expenses.push({ id: rows[0].id, ...expense });
    }
    console.log(`Seeded ${expenses.length} expenses.`);

    // 11. Kits de Produtos
    console.log('Seeding product kits...');
    const productKits = [];
    for (let i = 0; i < 5; i++) {
      const kit = {
        name: `Kit ${faker.commerce.productAdjective()} ${faker.commerce.product()}`,
        description: faker.lorem.sentence(),
        price: faker.commerce.price({ min: 100, max: 2000, dec: 2 }),
        branch_id: 1, // Assuming default branch_id is 1
      };
      const { rows } = await client.query(
        'INSERT INTO product_kits (name, description, price, branch_id) VALUES ($1, $2, $3, $4) RETURNING id',
        [kit.name, kit.description, kit.price, kit.branch_id]
      );
      productKits.push({ id: rows[0].id, ...kit });
    }
    console.log(`Seeded ${productKits.length} product kits.`);

    // 12. Leads
    console.log('Seeding leads...');
    const leads = [];
    const leadSources = ['Website', 'Telefone', 'Indicação', 'Feira', 'Outro'];
    const leadStatuses = ['Novo', 'Em Contato', 'Qualificado', 'Não Qualificado', 'Convertido'];
    for (let i = 0; i < 20; i++) {
      const lead = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number('## #####-####'),
        status: faker.helpers.arrayElement(leadStatuses),
        source: faker.helpers.arrayElement(leadSources),
        branch_id: 1, // Assuming default branch_id is 1
      };
      const { rows } = await client.query(
        'INSERT INTO leads (name, email, phone, status, source, branch_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [lead.name, lead.email, lead.phone, lead.status, lead.source, lead.branch_id]
      );
      leads.push({ id: rows[0].id, ...lead });
    }
    console.log(`Seeded ${leads.length} leads.`);

    // 13. Notificações
    console.log('Seeding notifications...');
    const notificationTypes = ['stock_alert', 'sale_goal', 'repair_status', 'system_update'];
    for (let i = 0; i < 30; i++) {
      const user = faker.helpers.arrayElement(users);
      const notification = {
        user_id: user.id,
        type: faker.helpers.arrayElement(notificationTypes),
        message: faker.lorem.sentence(),
        read_status: faker.datatype.boolean(),
        branch_id: 1, // Assuming default branch_id is 1
      };
      const { rows } = await client.query(
        'INSERT INTO notifications (user_id, type, message, read_status, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [notification.user_id, notification.type, notification.message, notification.read_status, notification.branch_id]
      );
    }
    console.log('Seeded notifications.');

    // 14. Histórico de Estoque
    console.log('Seeding stock history...');
    const stockChangeTypes = ['entrada', 'saída', 'ajuste', 'devolução'];
    for (let i = 0; i < 50; i++) {
      const variation = faker.helpers.arrayElement(productVariations);
      const user = faker.helpers.arrayElement(users);
      const changeType = faker.helpers.arrayElement(stockChangeTypes);
      const quantityChange = faker.number.int({ min: -10, max: 10 }); // Can be positive or negative
      const stockHistory = {
        variation_id: variation.id,
        user_id: user.id,
        change_type: changeType,
        quantity_change: quantityChange,
        reason: faker.lorem.sentence(),
      };
      await client.query(
        'INSERT INTO stock_history (variation_id, user_id, change_type, quantity_change, reason) VALUES ($1, $2, $3, $4, $5)',
        [stockHistory.variation_id, stockHistory.user_id, stockHistory.change_type, stockHistory.quantity_change, stockHistory.reason]
      );
    }
    console.log('Seeded stock history.');

    // 15. Log de Atividades
    console.log('Seeding activity log...');
    const entityTypes = ['user', 'product', 'sale', 'repair', 'customer'];
    for (let i = 0; i < 100; i++) {
      const user = faker.helpers.arrayElement(users);
      const entityType = faker.helpers.arrayElement(entityTypes);
      let entityId = null;
      if (entityType === 'user') entityId = faker.helpers.arrayElement(users).id;
      if (entityType === 'product') entityId = faker.helpers.arrayElement(products).id;
      if (entityType === 'sale') entityId = faker.helpers.arrayElement(sales).id;
      if (entityType === 'repair') entityId = faker.helpers.arrayElement(repairs).id;
      if (entityType === 'customer') entityId = faker.helpers.arrayElement(customers).id;

      const activity = {
        user_name: user.name,
        description: faker.lorem.sentence(),
        entity_type: entityType,
        entity_id: entityId,
        branch_id: 1, // Assuming default branch_id is 1
      };
      await client.query(
        'INSERT INTO activity_log (user_name, description, entity_type, entity_id, branch_id) VALUES ($1, $2, $3, $4, $5)',
        [activity.user_name, activity.description, activity.entity_type, activity.entity_id, activity.branch_id]
      );
    }
    console.log('Seeded activity log.');

    // 16. Sessões de Caixa e Fechamentos
    console.log('Seeding cash sessions and closings...');
    const cashSessionStatuses = ['open', 'closed'];
    for (let i = 0; i < 10; i++) {
      const user = faker.helpers.arrayElement(users);
      const openingBalance = faker.commerce.price({ min: 100, max: 500, dec: 2 });
      const status = faker.helpers.arrayElement(cashSessionStatuses);
      let closedAt = null;
      let closingBalance = null;
      let calculatedBalance = null;
      let difference = null;

      if (status === 'closed') {
        closedAt = faker.date.recent({ days: 30 });
        closingBalance = faker.commerce.price({ min: openingBalance, max: openingBalance * 2, dec: 2 });
        calculatedBalance = faker.commerce.price({ min: openingBalance, max: openingBalance * 2, dec: 2 });
        difference = parseFloat((closingBalance - calculatedBalance).toFixed(2));
      }

      const { rows: sessionRows } = await client.query(
        'INSERT INTO cash_sessions (user_id, opening_balance, closing_balance, calculated_balance, difference, status, opened_at, closed_at, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        [user.id, openingBalance, closingBalance, calculatedBalance, difference, status, faker.date.recent({ days: 60 }), closedAt, faker.lorem.sentence()]
      );
      const cashSessionId = sessionRows[0].id;

      if (status === 'closed') {
        const totalDiscrepancy = difference;
        const { rows: closingRows } = await client.query(
          'INSERT INTO cash_drawer_closings (cash_session_id, closed_by_user_id, closing_time, total_discrepancy, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [cashSessionId, user.id, closedAt, totalDiscrepancy, faker.lorem.sentence()]
        );
        const cashDrawerClosingId = closingRows[0].id;

        // Seed cash_drawer_closing_details
        let remainingClosingAmount = closingBalance;
        const paymentMethodsForClosing = faker.helpers.arrayElements(paymentMethods, { min: 1, max: paymentMethods.length });
        for (const pm of paymentMethodsForClosing) {
          const countedAmount = faker.commerce.price({ min: 0, max: remainingClosingAmount, dec: 2 });
          const systemAmount = faker.commerce.price({ min: 0, max: remainingClosingAmount, dec: 2 });
          const detailDiscrepancy = parseFloat((countedAmount - systemAmount).toFixed(2));
          await client.query(
            'INSERT INTO cash_drawer_closing_details (cash_drawer_closing_id, payment_method_id, counted_amount, system_amount, discrepancy) VALUES ($1, $2, $3, $4, $5)',
            [cashDrawerClosingId, pm.id, countedAmount, systemAmount, detailDiscrepancy]
          );
          remainingClosingAmount -= countedAmount; // Adjust remaining amount for next payment method
        }
      }
    }
    console.log('Seeded cash sessions and closings.');

    // 17. Sugestões de Produtos
    console.log('Seeding product suggestions...');
    for (let i = 0; i < 20; i++) {
      const product1 = faker.helpers.arrayElement(products);
      const product2 = faker.helpers.arrayElement(products);
      if (product1.id !== product2.id) { // Ensure different products
        await client.query(
          'INSERT INTO product_suggestions (product_id, suggested_product_id, frequency) VALUES ($1, $2, $3) ON CONFLICT (product_id, suggested_product_id) DO NOTHING',
          [product1.id, product2.id, faker.number.int({ min: 1, max: 100 })]
        );
      }
    }
    console.log('Seeded product suggestions.');

    // 18. Histórico de Login
    console.log('Seeding login history...');
    for (let i = 0; i < 50; i++) {
      const user = faker.helpers.arrayElement(users);
      await client.query(
        'INSERT INTO login_history (user_id, login_at, ip_address, user_agent, success) VALUES ($1, $2, $3, $4, $5)',
        [user.id, faker.date.recent({ days: 90 }), faker.internet.ip(), faker.internet.userAgent(), faker.datatype.boolean()]
      );
    }
    console.log('Seeded login history.');

    // 19. Configurações da Tela de Login (apenas uma entrada)
    console.log('Seeding login screen settings...');
    const loginScreenSettings = {
      background_type: faker.helpers.arrayElement(['solid', 'image', 'video', 'gradient']),
      background_solid_color: faker.internet.color(),
      background_image_url: faker.image.urlPicsumPhotos(),
      background_video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Example video URL
      image_size: faker.helpers.arrayElement(['cover', 'contain', 'auto']),
      image_repeat: faker.helpers.arrayElement(['repeat', 'no-repeat', 'repeat-x', 'repeat-y']),
      gradient_color_1: faker.internet.color(),
      gradient_color_2: faker.internet.color(),
      gradient_color_3: faker.internet.color(),
      gradient_color_4: faker.internet.color(),
      gradient_speed: faker.number.int({ min: 5, max: 30 }),
      gradient_direction: faker.number.int({ min: 0, max: 360 }).toString(),
    };
    await client.query(
      `INSERT INTO login_screen_settings (
        background_type, background_solid_color, background_image_url, background_video_url,
        image_size, image_repeat, gradient_color_1, gradient_color_2,
        gradient_color_3, gradient_color_4, gradient_speed, gradient_direction
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT DO NOTHING`,
      [
        loginScreenSettings.background_type, loginScreenSettings.background_solid_color,
        loginScreenSettings.background_image_url, loginScreenSettings.background_video_url,
        loginScreenSettings.image_size, loginScreenSettings.image_repeat,
        loginScreenSettings.gradient_color_1, loginScreenSettings.gradient_color_2,
        loginScreenSettings.gradient_color_3, loginScreenSettings.gradient_color_4,
        loginScreenSettings.gradient_speed, loginScreenSettings.gradient_direction
      ]
    );
    console.log('Seeded login screen settings.');

    // 20. Conversas e Mensagens do WhatsApp
    console.log('Seeding WhatsApp conversations and messages...');
    const whatsappConversationStatuses = ['open', 'closed', 'pending'];
    for (let i = 0; i < 15; i++) {
      const customer = faker.helpers.arrayElement(customers);
      const conversationStatus = faker.helpers.arrayElement(whatsappConversationStatuses);
      const { rows: convoRows } = await client.query(
        'INSERT INTO whatsapp_conversations (customer_id, last_message_timestamp, status) VALUES ($1, $2, $3) RETURNING conversation_id',
        [customer.id, faker.date.recent({ days: 30 }), conversationStatus]
      );
      const conversationId = convoRows[0].conversation_id;

      const numMessages = faker.number.int({ min: 2, max: 10 });
      for (let j = 0; j < numMessages; j++) {
        const direction = faker.helpers.arrayElement(['inbound', 'outbound']);
        const senderType = direction === 'inbound' ? 'customer' : 'system';
        
        await client.query(
          'INSERT INTO whatsapp_messages (conversation_id, sender_type, message_content, timestamp, status, direction) VALUES ($1, $2, $3, $4, $5, $6)',
          [conversationId, senderType, faker.lorem.sentence(), faker.date.recent({ days: 29 }), 'read', direction]
        );
      }
    }
    console.log('Seeded WhatsApp conversations and messages.');

    // 21. Integração com Instagram (apenas uma entrada por filial)
    console.log('Seeding Instagram integration...');
    await client.query(
      `INSERT INTO instagram_integration (branch_id, instagram_business_account_id, access_token, token_expires_at) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (branch_id) DO NOTHING`,
      [
        1, // branch_id
        faker.string.uuid(), // instagram_business_account_id
        faker.string.uuid(), // access_token
        faker.date.future({ years: 1 }) // token_expires_at
      ]
    );
    console.log('Seeded Instagram integration.');

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