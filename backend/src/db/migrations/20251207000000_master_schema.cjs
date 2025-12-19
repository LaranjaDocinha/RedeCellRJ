exports.up = (pgm) => {
  // --- EXTENSIONS ---
  pgm.createExtension('uuid-ossp', { ifNotExists: true });

  // --- RBAC (Roles & Permissions) ---
  pgm.createTable('roles', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(50)', notNull: true, unique: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('permissions', {
    id: { type: 'serial', primaryKey: true },
    action: { type: 'varchar(50)', notNull: true },
    subject: { type: 'varchar(50)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  }, {
    constraints: {
      unique: [['action', 'subject']]
    }
  });

  pgm.createTable('role_permissions', {
    role_id: { type: 'integer', notNull: true, references: 'roles(id)', onDelete: 'CASCADE' },
    permission_id: { type: 'integer', notNull: true, references: 'permissions(id)', onDelete: 'CASCADE' },
  }, {
    constraints: {
      primaryKey: ['role_id', 'permission_id']
    }
  });

  // --- CORE AUTH & USERS ---
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    // role: removido coluna simples em favor da tabela user_roles, mas mantido para compatibilidade se codigo legado usar
    role: { type: 'varchar(50)', default: 'employee' }, 
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('user_roles', {
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    role_id: { type: 'integer', notNull: true, references: 'roles(id)', onDelete: 'CASCADE' },
  }, {
    constraints: {
      primaryKey: ['user_id', 'role_id']
    }
  });

  // --- AUDIT LOGS ---
  pgm.createTable('audit_logs', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    action: { type: 'varchar(255)', notNull: true },
    entity_type: { type: 'varchar(255)' },
    entity_id: { type: 'uuid' }, // Pode ser uuid ou integer, dependendo da entidade
    details: { type: 'jsonb' },
    ip_address: { type: 'varchar(45)' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('customers', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', unique: true },
    phone: { type: 'varchar(50)' },
    cpf: { type: 'varchar(20)' },
    address: { type: 'text' },
    loyalty_points: { type: 'integer', default: 0 },
    store_credit_balance: { type: 'decimal(10, 2)', default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // --- STORE CREDIT TRANSACTIONS ---
  pgm.createTable('store_credit_transactions', {
    id: { type: 'serial', primaryKey: true },
    customer_id: { type: 'integer', notNull: true, references: 'customers(id)', onDelete: 'CASCADE' },
    amount: { type: 'decimal(10, 2)', notNull: true },
    type: { type: 'varchar(50)', notNull: true }, // 'add', 'debit', 'refund'
    related_id: { type: 'integer' }, // Pode referenciar sale_id, return_id, etc.
    reason: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('branches', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    address: { type: 'text' },
    phone: { type: 'varchar(50)' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // --- LEADS & CRM ---
  pgm.createTable('leads', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', unique: true, notNull: true },
    phone: { type: 'varchar(50)' },
    source: { type: 'varchar(50)' }, // Ex: 'website', 'referral', 'event'
    status: { type: 'varchar(50)', notNull: true, default: 'new' }, // 'new', 'contacted', 'qualified', 'unqualified', 'converted'
    assigned_to: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' }, // User ID (UUID)
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('lead_activities', {
    id: { type: 'serial', primaryKey: true },
    lead_id: { type: 'integer', notNull: true, references: 'leads(id)', onDelete: 'CASCADE' },
    activity_type: { type: 'varchar(50)', notNull: true }, // 'call', 'email', 'meeting', 'note'
    description: { type: 'text' },
    activity_date: { type: 'timestamp', notNull: true },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'SET NULL' }, // User who performed the activity (UUID)
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // --- PRODUCTS & INVENTORY ---
  pgm.createTable('suppliers', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    contact_info: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('products', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    branch_id: { type: 'integer', references: 'branches(id)' },
    sku: { type: 'varchar(100)' }, // SKU base
    is_serialized: { type: 'boolean', default: false },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('product_variations', {
    id: { type: 'serial', primaryKey: true },
    product_id: { type: 'integer', notNull: true, references: 'products(id)', onDelete: 'CASCADE' },
    name: { type: 'varchar(255)' }, // Ex: "Azul", "128GB"
    sku: { type: 'varchar(100)', unique: true },
    price: { type: 'decimal(10, 2)', notNull: true },
    cost_price: { type: 'decimal(10, 2)', default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('branch_product_variations_stock', {
    branch_id: { type: 'integer', notNull: true, references: 'branches(id)', onDelete: 'CASCADE' },
    product_variation_id: { type: 'integer', notNull: true, references: 'product_variations(id)', onDelete: 'CASCADE' },
    stock_quantity: { type: 'integer', notNull: true, default: 0 },
    min_stock_level: { type: 'integer', default: 0 }, // Pode ter um limite de estoque mínimo por filial
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  }, {
    constraints: {
      primaryKey: ['branch_id', 'product_variation_id']
    }
  });

  // --- PARTS (LEGACY/SPECIFIC) ---
  pgm.createTable('parts', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    sku: { type: 'varchar(100)', unique: true },
    stock_quantity: { type: 'integer', default: 0 },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('part_suppliers', {
    part_id: { type: 'integer', notNull: true, references: 'parts(id)', onDelete: 'CASCADE' },
    supplier_id: { type: 'integer', notNull: true, references: 'suppliers(id)', onDelete: 'CASCADE' },
    cost: { type: 'decimal(10, 2)', notNull: true },
  }, {
    constraints: {
      primaryKey: ['part_id', 'supplier_id']
    }
  });

  // --- CHECKLISTS ---
  pgm.createTable('checklist_templates', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    type: { type: 'varchar(50)' }, // pre-repair, post-repair
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('checklist_template_items', {
    id: { type: 'serial', primaryKey: true },
    template_id: { type: 'integer', notNull: true, references: 'checklist_templates(id)', onDelete: 'CASCADE' },
    item_name: { type: 'varchar(255)', notNull: true },
    position: { type: 'integer', default: 0 },
  });

  // --- SALES & ORDERS ---
  pgm.createTable('sales', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    customer_id: { type: 'integer', references: 'customers(id)' },
    branch_id: { type: 'integer', references: 'branches(id)' },
    total_amount: { type: 'decimal(10, 2)', notNull: true },
    external_order_id: { type: 'varchar(100)' },
    marketplace_integration_id: { type: 'integer' },
    status: { type: 'varchar(50)', default: 'completed' }, // pending, completed, cancelled
    sale_date: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('sale_items', {
    id: { type: 'serial', primaryKey: true },
    sale_id: { type: 'integer', notNull: true, references: 'sales(id)', onDelete: 'CASCADE' },
    product_id: { type: 'integer', references: 'products(id)' },
    variation_id: { type: 'integer', references: 'product_variations(id)' },
    quantity: { type: 'integer', notNull: true },
    unit_price: { type: 'decimal(10, 2)', notNull: true },
    cost_price: { type: 'decimal(10, 2)', notNull: true }, // Snapshot do custo
    total_price: { type: 'decimal(10, 2)', notNull: true },
    metadata: { type: 'jsonb' },
  });

  pgm.createTable('sale_payments', {
    id: { type: 'serial', primaryKey: true },
    sale_id: { type: 'integer', notNull: true, references: 'sales(id)', onDelete: 'CASCADE' },
    payment_method: { type: 'varchar(50)', notNull: true },
    amount: { type: 'decimal(10, 2)', notNull: true },
    transaction_details: { type: 'jsonb' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('discounts', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true, unique: true },
    type: { type: 'varchar(50)', notNull: true }, // percentage, fixed_amount
    value: { type: 'decimal(10, 2)', notNull: true },
    start_date: { type: 'timestamp', notNull: true },
    end_date: { type: 'timestamp' },
    is_active: { type: 'boolean', default: true },
    min_purchase_amount: { type: 'decimal(10, 2)' },
    max_uses: { type: 'integer' },
    uses_count: { type: 'integer', default: 0 },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  
  // --- RETURNS ---
  pgm.createTable('returns', {
    id: { type: 'serial', primaryKey: true },
    sale_id: { type: 'integer', references: 'sales(id)', notNull: true },
    reason: { type: 'text' },
    status: { type: 'varchar(50)', default: 'pending' }, // pending, approved, rejected, completed
    refund_amount: { type: 'decimal(10, 2)', notNull: true },
    refund_method: { type: 'varchar(50)' }, // original_payment, store_credit
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('return_items', {
    id: { type: 'serial', primaryKey: true },
    return_id: { type: 'integer', references: 'returns(id)', onDelete: 'CASCADE' },
    sale_item_id: { type: 'integer' }, // Referencia logica
    variation_id: { type: 'integer', references: 'product_variations(id)' },
    quantity: { type: 'integer', notNull: true },
    condition: { type: 'varchar(50)' }, // new, damaged, open_box
    inspection_status: { type: 'varchar(50)', default: 'pending' }, // pending, approved, rejected
    inspection_notes: { type: 'text' },
    inspected_by: { type: 'uuid', references: 'users(id)' },
    inspected_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // --- SERVICE ORDERS (OS) ---
  pgm.createTable('service_orders', {
    id: { type: 'serial', primaryKey: true },
    customer_id: { type: 'integer', references: 'customers(id)', notNull: true },
    branch_id: { type: 'integer', references: 'branches(id)' },
    user_id: { type: 'uuid', references: 'users(id)' }, // Técnico responsável inicial
    device_name: { type: 'varchar(255)', notNull: true },
    device_imei: { type: 'varchar(100)' },
    device_password: { type: 'varchar(100)' },
    problem_description: { type: 'text', notNull: true },
    status: { type: 'varchar(50)', default: 'open' }, // open, analysis, waiting_approval, in_progress, finished, delivered, cancelled
    priority: { type: 'varchar(20)', default: 'normal' },
    estimated_cost: { type: 'decimal(10, 2)' },
    final_cost: { type: 'decimal(10, 2)' },
    entry_date: { type: 'timestamp', default: pgm.func('current_timestamp') },
    delivery_date: { type: 'timestamp' },
    
    // Novas Colunas para MASTER PLAN
    public_token: { type: 'varchar(64)', unique: true }, // Para acesso externo
    customer_approval_status: { type: 'varchar(20)', default: 'pending' }, // pending, approved, rejected
    customer_approval_date: { type: 'timestamp' },
    inspection_checklist: { type: 'jsonb' }, // Checklist de entrada
    notes: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // --- DIAGNOSTICS WIZARD ---
  pgm.createTable('diagnostic_nodes', {
    id: { type: 'serial', primaryKey: true },
    question_text: { type: 'text', notNull: true },
    is_solution: { type: 'boolean', default: false },
    solution_details: { type: 'text' },
    parent_node_id: { type: 'integer', references: 'diagnostic_nodes(id)', onDelete: 'CASCADE' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('diagnostic_node_options', {
    id: { type: 'serial', primaryKey: true },
    node_id: { type: 'integer', notNull: true, references: 'diagnostic_nodes(id)', onDelete: 'CASCADE' },
    option_text: { type: 'text', notNull: true },
    next_node_id: { type: 'integer', references: 'diagnostic_nodes(id)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('diagnostic_feedback', {
    id: { type: 'serial', primaryKey: true },
    node_id: { type: 'integer', references: 'diagnostic_nodes(id)', onDelete: 'SET NULL' },
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    is_helpful: { type: 'boolean' },
    comments: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('diagnostic_history', {
    id: { type: 'serial', primaryKey: true },
    service_order_id: { type: 'integer', references: 'service_orders(id)', onDelete: 'CASCADE' },
    path_taken: { type: 'jsonb' }, // Array of node IDs
    result_node_id: { type: 'integer', references: 'diagnostic_nodes(id)' },
    performed_by: { type: 'uuid', references: 'users(id)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // --- FINANCIAL ---
  pgm.createTable('expense_reimbursements', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)' },
    amount: { type: 'decimal(10, 2)', notNull: true },
    description: { type: 'text', notNull: true },
    status: { type: 'varchar(50)', default: 'pending' }, // pending, approved, rejected
    approved_by: { type: 'uuid', references: 'users(id)' },
    rejection_reason: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('service_items', {
    id: { type: 'serial', primaryKey: true },
    service_order_id: { type: 'integer', references: 'service_orders(id)', onDelete: 'CASCADE' },
    description: { type: 'varchar(255)', notNull: true }, // Ex: "Troca de Tela" ou "Peça: Display"
    variation_id: { type: 'integer', references: 'product_variations(id)' }, // Se for peça do estoque
    quantity: { type: 'integer', default: 1 },
    unit_price: { type: 'decimal(10, 2)', notNull: true },
    cost_price: { type: 'decimal(10, 2)', default: 0 },
    type: { type: 'varchar(20)', notNull: true }, // 'service' or 'product'
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('service_order_photos', { // NEW: Tech App
    id: { type: 'serial', primaryKey: true },
    service_order_id: { type: 'integer', references: 'service_orders(id)', onDelete: 'CASCADE' },
    url: { type: 'text', notNull: true },
    type: { type: 'varchar(20)' }, // 'entry', 'exit', 'internal'
    uploaded_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    uploaded_by: { type: 'uuid', references: 'users(id)' },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // --- MESSAGING & NOTIFICATIONS (MASTER PLAN) ---
  pgm.createTable('whatsapp_templates', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true, unique: true }, // ex: 'os_created'
    content: { type: 'text', notNull: true }, // ex: 'Olá {{name}}, sua OS {{os_id}} foi aberta.'
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('whatsapp_logs', {
    id: { type: 'serial', primaryKey: true },
    customer_id: { type: 'integer', references: 'customers(id)' },
    phone: { type: 'varchar(50)', notNull: true },
    content: { type: 'text', notNull: true },
    status: { type: 'varchar(20)', default: 'pending' }, // pending, sent, failed, delivered
    error_message: { type: 'text' },
    sent_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // --- MARKETPLACE HUB (MASTER PLAN) ---
  pgm.createTable('marketplace_configs', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(50)', notNull: true }, // 'mercadolivre', 'shopee'
    api_key: { type: 'text' },
    api_secret: { type: 'text' },
    access_token: { type: 'text' },
    refresh_token: { type: 'text' },
    token_expires_at: { type: 'timestamp' },
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('marketplace_listings', {
    id: { type: 'serial', primaryKey: true },
    marketplace_id: { type: 'integer', references: 'marketplace_configs(id)' },
    product_variation_id: { type: 'integer', references: 'product_variations(id)' },
    external_id: { type: 'varchar(100)', notNull: true }, // ID no ML/Shopee
    external_url: { type: 'text' },
    status: { type: 'varchar(20)' }, // active, paused, closed
    last_synced_at: { type: 'timestamp' },
    sync_error: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  }, {
    constraints: {
      unique: [['marketplace_id', 'external_id']]
    }
  });

  // --- SMART PRICING (MASTER PLAN) ---
  pgm.createTable('pricing_rules', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    condition_type: { type: 'varchar(50)', notNull: true }, // 'low_turnover', 'high_demand'
    condition_value: { type: 'jsonb', notNull: true }, // { days_without_sale: 30 }
    action_type: { type: 'varchar(50)', notNull: true }, // 'discount_percentage', 'markup_percentage'
    action_value: { type: 'decimal(10, 2)', notNull: true },
    is_active: { type: 'boolean', default: true },
    priority: { type: 'integer', default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('price_history', {
    id: { type: 'serial', primaryKey: true },
    variation_id: { type: 'integer', references: 'product_variations(id)' },
    old_price: { type: 'decimal(10, 2)', notNull: true },
    new_price: { type: 'decimal(10, 2)', notNull: true },
    reason: { type: 'varchar(255)' }, // 'smart_pricing_rule_1', 'manual_update'
    changed_by: { type: 'uuid', references: 'users(id)' }, // Null se for sistema
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  
  // --- KANBAN ---
  pgm.createTable('kanban_columns', {
      id: { type: 'serial', primaryKey: true },
      title: { type: 'varchar(255)', notNull: true },
      position: { type: 'integer', notNull: true, default: 0 },
      is_system: { type: 'boolean', default: false }, // Colunas padrão que não podem ser deletadas
      created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  pgm.createTable('kanban_cards', {
      id: { type: 'serial', primaryKey: true },
      column_id: { type: 'integer', references: 'kanban_columns(id)', onDelete: 'CASCADE' },
      title: { type: 'varchar(255)', notNull: true },
      description: { type: 'text' },
      priority: { type: 'varchar(20)', default: 'normal' },
      due_date: { type: 'timestamp' },
      position: { type: 'integer', notNull: true, default: 0 },
      tags: { type: 'jsonb' },
      assignees: { type: 'jsonb' }, // Array de user_ids
      service_order_id: { type: 'integer', references: 'service_orders(id)', onDelete: 'SET NULL' }, // Link opcional com OS
      created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
  });

  // --- ACTIVITY FEED ---
  pgm.createTable('activity_feed', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'CASCADE' },
    branch_id: { type: 'integer', references: 'branches(id)', onDelete: 'SET NULL' },
    activity_type: { type: 'varchar(50)', notNull: true },
    activity_data: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // --- GAMIFICATION ---
  pgm.createTable('gamification_challenges', {
    id: { type: 'serial', primaryKey: true },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    metric: { type: 'varchar(50)', notNull: true },
    target_value: { type: 'decimal(10, 2)', notNull: true },
    reward_xp: { type: 'integer', notNull: true },
    start_date: { type: 'timestamp', notNull: true },
    end_date: { type: 'timestamp', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('user_challenge_progress', {
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    challenge_id: { type: 'integer', notNull: true, references: 'gamification_challenges(id)', onDelete: 'CASCADE' },
    current_value: { type: 'decimal(10, 2)', default: 0 },
    completed: { type: 'boolean', default: false },
    completed_at: { type: 'timestamp' },
  }, {
    constraints: {
      primaryKey: ['user_id', 'challenge_id']
    }
  });

  pgm.createTable('badges', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true, unique: true },
    description: { type: 'text' },
    icon_url: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('user_badges', {
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    badge_id: { type: 'integer', notNull: true, references: 'badges(id)', onDelete: 'CASCADE' },
    awarded_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  }, {
    constraints: {
      primaryKey: ['user_id', 'badge_id']
    }
  });

};

exports.down = (pgm) => {
  // Drop em ordem reversa de dependência
  pgm.dropTable('user_badges');
  pgm.dropTable('badges');
  pgm.dropTable('user_challenge_progress');
  pgm.dropTable('gamification_challenges');
  pgm.dropTable('activity_feed');
  pgm.dropTable('kanban_cards');
  pgm.dropTable('kanban_columns');
  pgm.dropTable('price_history');
  pgm.dropTable('pricing_rules');
  pgm.dropTable('marketplace_listings');
  pgm.dropTable('marketplace_configs');
  pgm.dropTable('whatsapp_logs');
  pgm.dropTable('whatsapp_templates');
  pgm.dropTable('expense_reimbursements');
  pgm.dropTable('diagnostic_history');
  pgm.dropTable('diagnostic_feedback');
  pgm.dropTable('diagnostic_node_options');
  pgm.dropTable('diagnostic_nodes');
  pgm.dropTable('service_order_photos');
  pgm.dropTable('service_items');
  pgm.dropTable('service_orders');
  pgm.dropTable('return_items');
  pgm.dropTable('returns');
  pgm.dropTable('discounts');
  pgm.dropTable('sale_items');
  pgm.dropTable('sale_payments');
  pgm.dropTable('sales');
  pgm.dropTable('branch_product_variations_stock'); // NEW
  pgm.dropTable('product_variations');
  pgm.dropTable('products');
  pgm.dropTable('suppliers');
  pgm.dropTable('branches');
  pgm.dropTable('customers');
  pgm.dropTable('lead_activities'); // NEW
  pgm.dropTable('leads'); // NEW
  pgm.dropTable('audit_logs');
  pgm.dropTable('store_credit_transactions');
  pgm.dropTable('user_roles');
  pgm.dropTable('users');
  pgm.dropExtension('uuid-ossp');
};
