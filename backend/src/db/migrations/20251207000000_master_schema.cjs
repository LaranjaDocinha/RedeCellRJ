exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createExtension('uuid-ossp', { ifNotExists: true });

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
  });

  pgm.addConstraint('permissions', 'permissions_uniq_action_subject', {
    unique: ['action', 'subject'],
  });

  pgm.createTable('role_permissions', {
    role_id: { type: 'integer', notNull: true, references: 'roles(id)', onDelete: 'CASCADE' },
    permission_id: { type: 'integer', notNull: true, references: 'permissions(id)', onDelete: 'CASCADE' },
  });
  pgm.addConstraint('role_permissions', 'role_permissions_pkey', {
    primaryKey: ['role_id', 'permission_id'],
  });

  pgm.createTable('branches', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true, unique: true },
    address: { type: 'text' },
    phone: { type: 'varchar(50)' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
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

  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    customer_id: { type: 'integer', references: 'customers(id)', onDelete: 'SET NULL' },
    branch_id: { type: 'integer', references: 'branches(id)', onDelete: 'SET NULL' },
    role: { type: 'varchar(50)', default: 'employee' },
    theme_preference: { type: 'varchar(20)', default: 'light' },
    xp: { type: 'integer', default: 0 },
    level: { type: 'integer', default: 1 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('user_roles', {
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    role_id: { type: 'integer', notNull: true, references: 'roles(id)', onDelete: 'CASCADE' },
  });
  pgm.addConstraint('user_roles', 'user_roles_pkey', {
    primaryKey: ['user_id', 'role_id'],
  });

  pgm.createTable('audit_logs', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    action: { type: 'varchar(255)', notNull: true },
    entity_type: { type: 'varchar(255)' },
    entity_id: { type: 'uuid' },
    details: { type: 'jsonb' },
    ip_address: { type: 'varchar(45)' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('store_credit_transactions', {
    id: { type: 'serial', primaryKey: true },
    customer_id: { type: 'integer', notNull: true, references: 'customers(id)', onDelete: 'CASCADE' },
    amount: { type: 'decimal(10, 2)', notNull: true },
    type: { type: 'varchar(50)', notNull: true },
    related_id: { type: 'integer' },
    reason: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('leads', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    phone: { type: 'varchar(50)' },
    source: { type: 'varchar(50)' },
    status: { type: 'varchar(50)', notNull: true, default: 'new' },
    assigned_to: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('lead_activities', {
    id: { type: 'serial', primaryKey: true },
    lead_id: { type: 'integer', notNull: true, references: 'leads(id)', onDelete: 'CASCADE' },
    activity_type: { type: 'varchar(50)', notNull: true },
    description: { type: 'text' },
    activity_date: { type: 'timestamp', notNull: true },
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('suppliers', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true, unique: true },
    contact_info: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('categories', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true, unique: true },
    description: { type: 'text' },
    parent_id: { type: 'integer', references: 'categories(id)', onDelete: 'CASCADE' },
    icon: { type: 'varchar(50)' },
    color: { type: 'varchar(20)' },
    slug: { type: 'varchar(255)', unique: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('products', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    branch_id: { type: 'integer', references: 'branches(id)' },
    category_id: { type: 'integer', references: 'categories(id)', onDelete: 'SET NULL' },
    sku: { type: 'varchar(100)', unique: true },
    product_type: { type: 'varchar(50)', notNull: true, default: 'Produto' },
    is_serialized: { type: 'boolean', default: false },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('product_variations', {
    id: { type: 'serial', primaryKey: true },
    product_id: { type: 'integer', notNull: true, references: 'products(id)', onDelete: 'CASCADE' },
    name: { type: 'varchar(255)' },
    sku: { type: 'varchar(100)', unique: true },
    color: { type: 'varchar(50)' },
    price: { type: 'decimal(10, 2)', notNull: true },
    cost_price: { type: 'decimal(10, 2)', default: 0 },
    low_stock_threshold: { type: 'integer', default: 0 },
    reorder_point: { type: 'integer', default: 0 },
    lead_time_days: { type: 'integer', default: 7 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('branch_product_variations_stock', {
    branch_id: { type: 'integer', notNull: true, references: 'branches(id)', onDelete: 'CASCADE' },
    product_variation_id: { type: 'integer', notNull: true, references: 'product_variations(id)', onDelete: 'CASCADE' },
    stock_quantity: { type: 'integer', notNull: true, default: 0 },
    min_stock_level: { type: 'integer', default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('branch_product_variations_stock', 'branch_product_variations_stock_pkey', {
    primaryKey: ['branch_id', 'product_variation_id'],
  });

  pgm.createTable('product_stock', {
    product_variation_id: { type: 'integer', notNull: true, references: 'product_variations(id)', onDelete: 'CASCADE' },
    branch_id: { type: 'integer', notNull: true, references: 'branches(id)', onDelete: 'CASCADE' },
    quantity: { type: 'integer', notNull: true, default: 0 },
  });
  pgm.addConstraint('product_stock', 'product_stock_pkey', {
    primaryKey: ['product_variation_id', 'branch_id'],
  });

  pgm.createTable('inventory_movements', {
    id: { type: 'serial', primaryKey: true },
    product_variation_id: { type: 'integer', notNull: true, references: 'product_variations(id)', onDelete: 'CASCADE' },
    branch_id: { type: 'integer', notNull: true, references: 'branches(id)', onDelete: 'CASCADE' },
    quantity_change: { type: 'integer', notNull: true },
    reason: { type: 'varchar(50)', notNull: true },
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    unit_cost: { type: 'decimal(10, 2)' },
    quantity_remaining: { type: 'integer' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('parts', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    sku: { type: 'varchar(100)', unique: true },
    stock_quantity: { type: 'integer', default: 0 },
    low_stock_threshold: { type: 'integer', default: 0 },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('part_suppliers', {
    part_id: { type: 'integer', notNull: true, references: 'parts(id)', onDelete: 'CASCADE' },
    supplier_id: { type: 'integer', notNull: true, references: 'suppliers(id)', onDelete: 'CASCADE' },
    cost: { type: 'decimal(10, 2)', notNull: true },
  });
  pgm.addConstraint('part_suppliers', 'part_suppliers_pkey', {
    primaryKey: ['part_id', 'supplier_id'],
  });

  pgm.createTable('checklist_templates', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    type: { type: 'varchar(50)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('checklist_template_items', {
    id: { type: 'serial', primaryKey: true },
    template_id: { type: 'integer', notNull: true, references: 'checklist_templates(id)', onDelete: 'CASCADE' },
    item_name: { type: 'varchar(255)', notNull: true },
    position: { type: 'integer', default: 0 },
  });

  pgm.createTable('sales', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    customer_id: { type: 'integer', references: 'customers(id)', onDelete: 'CASCADE' },
    branch_id: { type: 'integer', references: 'branches(id)' },
    total_amount: { type: 'decimal(10, 2)', notNull: true },
    external_order_id: { type: 'varchar(100)' },
    marketplace_integration_id: { type: 'integer' },
    status: { type: 'varchar(50)', default: 'completed' },
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
    cost_price: { type: 'decimal(10, 2)', notNull: true },
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
    type: { type: 'varchar(50)', notNull: true },
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

  pgm.createTable('returns', {
    id: { type: 'serial', primaryKey: true },
    sale_id: { type: 'integer', notNull: true, references: 'sales(id)' },
    reason: { type: 'text' },
    status: { type: 'varchar(50)', default: 'pending' },
    refund_amount: { type: 'decimal(10, 2)', notNull: true },
    refund_method: { type: 'varchar(50)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('return_items', {
    id: { type: 'serial', primaryKey: true },
    return_id: { type: 'integer', references: 'returns(id)', onDelete: 'CASCADE' },
    sale_item_id: { type: 'integer' },
    variation_id: { type: 'integer', references: 'product_variations(id)' },
    quantity: { type: 'integer', notNull: true },
    condition: { type: 'varchar(50)' },
    inspection_status: { type: 'varchar(50)', default: 'pending' },
    inspection_notes: { type: 'text' },
    inspected_by: { type: 'uuid', references: 'users(id)' },
    inspected_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('service_orders', {
    id: { type: 'serial', primaryKey: true },
    customer_id: { type: 'integer', references: 'customers(id)', onDelete: 'CASCADE' },
    branch_id: { type: 'integer', references: 'branches(id)' },
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    product_description: { type: 'varchar(255)', notNull: true },
    brand: { type: 'varchar(100)' },
    imei: { type: 'varchar(100)' },
    device_password: { type: 'varchar(100)' },
    issue_description: { type: 'text', notNull: true },
    services: { type: 'jsonb' },
    observations: { type: 'text' },
    down_payment: { type: 'decimal(10, 2)', default: 0 },
    part_quality: { type: 'varchar(50)', default: 'Premium' },
    audio_url: { type: 'text' },
    expected_delivery_date: { type: 'timestamp' },
    last_status_update: { type: 'timestamp', default: pgm.func('current_timestamp') },
    status: { type: 'varchar(50)', default: 'Aguardando Avaliação' },
    priority: { type: 'varchar(20)', default: 'normal' },
    estimated_cost: { type: 'decimal(10, 2)' },
    final_cost: { type: 'decimal(10, 2)' },
    entry_date: { type: 'timestamp', default: pgm.func('current_timestamp') },
    delivery_date: { type: 'timestamp' },
    public_token: { type: 'varchar(64)', unique: true },
    customer_approval_status: { type: 'varchar(20)', default: 'pending' },
    customer_approval_date: { type: 'timestamp' },
    entry_checklist: { type: 'jsonb' },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('service_order_status_history', {
    id: { type: 'serial', primaryKey: true },
    service_order_id: { type: 'integer', notNull: true, references: 'service_orders(id)', onDelete: 'CASCADE' },
    old_status: { type: 'varchar(50)' },
    new_status: { type: 'varchar(50)', notNull: true },
    changed_by_user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    changed_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('service_order_items', {
    id: { type: 'serial', primaryKey: true },
    service_order_id: { type: 'integer', notNull: true, references: 'service_orders(id)', onDelete: 'CASCADE' },
    part_id: { type: 'integer', references: 'parts(id)', onDelete: 'SET NULL' },
    service_description: { type: 'varchar(255)' },
    quantity: { type: 'integer', notNull: true, default: 1 },
    unit_price: { type: 'decimal(10, 2)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('service_order_attachments', {
    id: { type: 'serial', primaryKey: true },
    service_order_id: { type: 'integer', notNull: true, references: 'service_orders(id)', onDelete: 'CASCADE' },
    file_path: { type: 'text', notNull: true },
    file_type: { type: 'varchar(50)', notNull: true },
    description: { type: 'text' },
    uploaded_by_user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    uploaded_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('service_order_comments', {
    id: { type: 'serial', primaryKey: true },
    service_order_id: { type: 'integer', notNull: true, references: 'service_orders(id)', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    comment_text: { type: 'text', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

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
    diagnostic_node_id: { type: 'integer', notNull: true, references: 'diagnostic_nodes(id)', onDelete: 'CASCADE' },
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
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    session_id: { type: 'uuid', notNull: true },
    node_id: { type: 'integer', notNull: true, references: 'diagnostic_nodes(id)', onDelete: 'CASCADE' },
    selected_option_id: { type: 'integer', references: 'diagnostic_node_options(id)', onDelete: 'SET NULL' },
    action: { type: 'varchar(255)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('expense_reimbursements', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)' },
    branch_id: { type: 'integer', references: 'branches(id)', onDelete: 'SET NULL' },
    amount: { type: 'decimal(10, 2)', notNull: true },
    description: { type: 'text', notNull: true },
    status: { type: 'varchar(50)', default: 'pending' },
    approved_by: { type: 'uuid', references: 'users(id)' },
    rejection_reason: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('purchase_orders', {
    id: { type: 'serial', primaryKey: true },
    supplier_id: { type: 'integer', references: 'suppliers(id)', onDelete: 'SET NULL' },
    branch_id: { type: 'integer', references: 'branches(id)', onDelete: 'SET NULL' },
    status: { type: 'varchar(50)', default: 'pending' },
    total_amount: { type: 'decimal(10, 2)', default: 0 },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('purchase_order_items', {
    id: { type: 'serial', primaryKey: true },
    purchase_order_id: { type: 'integer', notNull: true, references: 'purchase_orders(id)', onDelete: 'CASCADE' },
    product_variation_id: { type: 'integer', references: 'product_variations(id)', onDelete: 'SET NULL' },
    quantity: { type: 'integer', notNull: true },
    unit_price: { type: 'decimal(10, 2)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('accounts_payable', {
    id: { type: 'serial', primaryKey: true },
    supplier_id: { type: 'integer', references: 'suppliers(id)', onDelete: 'SET NULL' },
    branch_id: { type: 'integer', references: 'branches(id)', onDelete: 'SET NULL' },
    description: { type: 'text', notNull: true },
    amount: { type: 'decimal(10, 2)', notNull: true },
    due_date: { type: 'timestamp', notNull: true },
    status: { type: 'varchar(50)', default: 'pending' },
    paid_date: { type: 'timestamp' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('accounts_receivable', {
    id: { type: 'serial', primaryKey: true },
    customer_id: { type: 'integer', references: 'customers(id)', onDelete: 'SET NULL' },
    branch_id: { type: 'integer', references: 'branches(id)', onDelete: 'SET NULL' },
    description: { type: 'text', notNull: true },
    amount: { type: 'decimal(10, 2)', notNull: true },
    due_date: { type: 'timestamp', notNull: true },
    status: { type: 'varchar(50)', default: 'pending' },
    received_date: { type: 'timestamp' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('whatsapp_templates', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true, unique: true },
    content: { type: 'text', notNull: true },
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('whatsapp_logs', {
    id: { type: 'serial', primaryKey: true },
    customer_id: { type: 'integer', references: 'customers(id)' },
    phone: { type: 'varchar(50)', notNull: true },
    content: { type: 'text', notNull: true },
    status: { type: 'varchar(20)', default: 'pending' },
    error_message: { type: 'text' },
    sent_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('marketplace_configs', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(50)', notNull: true },
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
    external_id: { type: 'varchar(100)', notNull: true },
    external_url: { type: 'text' },
    status: { type: 'varchar(20)' },
    last_synced_at: { type: 'timestamp' },
    sync_error: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('marketplace_listings', 'marketplace_listings_uniq_marketplace_id_external_id', {
    unique: ['marketplace_id', 'external_id'],
  });

  pgm.createTable('pricing_rules', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true },
    condition_type: { type: 'varchar(50)', notNull: true },
    condition_value: { type: 'jsonb', notNull: true },
    action_type: { type: 'varchar(50)', notNull: true },
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
    reason: { type: 'varchar(255)' },
    changed_by: { type: 'uuid', references: 'users(id)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('kanban_columns', {
    id: { type: 'serial', primaryKey: true },
    title: { type: 'varchar(255)', notNull: true },
    position: { type: 'integer', notNull: true, default: 0 },
    is_system: { type: 'boolean', default: false },
    wip_limit: { type: 'integer', default: -1 },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
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
    assignees: { type: 'jsonb' },
    service_order_id: { type: 'integer', references: 'service_orders(id)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('activity_feed', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    branch_id: { type: 'integer', references: 'branches(id)', onDelete: 'SET NULL' },
    activity_type: { type: 'varchar(50)', notNull: true },
    activity_data: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

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
  });
  pgm.addConstraint('user_challenge_progress', 'user_challenge_progress_pkey', {
    primaryKey: ['user_id', 'challenge_id'],
  });

  pgm.createTable('badges', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true, unique: true },
    description: { type: 'text' },
    icon_url: { type: 'text' },
    metric: { type: 'varchar(50)' }, // Added metric
    threshold: { type: 'decimal(10, 2)' }, // Added threshold
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('user_badges', {
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    badge_id: { type: 'integer', notNull: true, references: 'badges(id)', onDelete: 'CASCADE' },
    awarded_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('user_badges', 'user_badges_pkey', {
    primaryKey: ['user_id', 'badge_id'],
  });

  pgm.createTable('coupons', {
    id: { type: 'serial', primaryKey: true },
    code: { type: 'varchar(50)', notNull: true, unique: true },
    type: { type: 'varchar(20)', notNull: true },
    value: { type: 'decimal(10, 2)', notNull: true },
    start_date: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    end_date: { type: 'timestamp' },
    min_purchase_amount: { type: 'decimal(10, 2)', default: 0 },
    max_uses: { type: 'integer' },
    uses_count: { type: 'integer', notNull: true, default: 0 },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('referrals', {
    id: { type: 'serial', primaryKey: true },
    referrer_customer_id: { type: 'integer', notNull: true, references: 'customers(id)', onDelete: 'CASCADE' },
    referred_customer_id: { type: 'integer', references: 'customers(id)', onDelete: 'SET NULL' },
    referral_code: { type: 'varchar(20)', notNull: true, unique: true },
    status: { type: 'varchar(20)', notNull: true, default: 'pending' },
    completed_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('loyalty_tiers', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true, unique: true },
    min_points: { type: 'integer', notNull: true },
    description: { type: 'text' },
    benefits: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('loyalty_transactions', {
    id: { type: 'serial', primaryKey: true },
    customer_id: { type: 'integer', notNull: true, references: 'customers(id)', onDelete: 'CASCADE' },
    points: { type: 'integer', notNull: true },
    type: { type: 'varchar(20)', notNull: true },
    reason: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('automations', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    trigger_type: { type: 'varchar(50)', notNull: true },
    trigger_config: { type: 'jsonb' },
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('automation_steps', {
    id: { type: 'serial', primaryKey: true },
    automation_id: { type: 'integer', notNull: true, references: 'automations(id)', onDelete: 'CASCADE' },
    type: { type: 'varchar(50)', notNull: true },
    payload: { type: 'jsonb' },
    order_index: { type: 'integer', notNull: true },
  });

  pgm.createTable('automation_runs', {
    id: { type: 'serial', primaryKey: true },
    automation_id: { type: 'integer', notNull: true, references: 'automations(id)', onDelete: 'CASCADE' },
    customer_id: { type: 'integer', notNull: true, references: 'customers(id)', onDelete: 'CASCADE' },
    status: { type: 'varchar(20)', notNull: true, default: 'active' },
    current_step: { type: 'integer', notNull: true, default: 0 },
    trigger_payload: { type: 'jsonb' },
    next_step_due_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('product_kits', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    price: { type: 'decimal(10, 2)', notNull: true },
    image_url: { type: 'text' },
    tags: { type: 'jsonb' },
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('product_kit_items', {
    id: { type: 'serial', primaryKey: true },
    kit_id: { type: 'integer', notNull: true, references: 'product_kits(id)', onDelete: 'CASCADE' },
    product_id: { type: 'integer', notNull: true, references: 'products(id)' },
    variation_id: { type: 'integer', notNull: true, references: 'product_variations(id)' },
    quantity: { type: 'integer', notNull: true, default: 1 },
  });

  pgm.createTable('time_clock_entries', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    branch_id: { type: 'integer', notNull: true, references: 'branches(id)', onDelete: 'CASCADE' },
    clock_in_time: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    clock_out_time: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('task_time_log', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    service_order_id: { type: 'integer', notNull: true, references: 'service_orders(id)', onDelete: 'CASCADE' },
    start_time: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    end_time: { type: 'timestamp' },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('quarantine_items', {
    id: { type: 'serial', primaryKey: true },
    product_id: { type: 'integer', references: 'products(id)', onDelete: 'SET NULL' },
    variation_id: { type: 'integer', references: 'product_variations(id)', onDelete: 'SET NULL' },
    supplier_id: { type: 'integer', references: 'suppliers(id)', onDelete: 'SET NULL' },
    service_order_id: { type: 'integer', references: 'service_orders(id)', onDelete: 'SET NULL' },
    quantity: { type: 'integer', notNull: true, default: 1 },
    reason: { type: 'text', notNull: true },
    defect_details: { type: 'text' },
    physical_location: { type: 'varchar(100)' }, // Gaveta, Caixa, Bacia
    is_battery_risk: { type: 'boolean', default: false }, // Baterias inchadas
    warranty_expiry_date: { type: 'timestamp' },
    item_cost: { type: 'decimal(10, 2)', default: 0 },
    status: { type: 'varchar(50)', notNull: true, default: 'Pending' }, 
    identified_by: { type: 'uuid', references: 'users(id)' },
    rma_tracking_code: { type: 'varchar(100)' },
    image_url: { type: 'text' },
    video_url: { type: 'text' },
    audio_url: { type: 'text' },
    signature_url: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('satisfaction_surveys', {
    id: { type: 'serial', primaryKey: true },
    service_order_id: { type: 'integer', references: 'service_orders(id)', onDelete: 'CASCADE' },
    customer_id: { type: 'integer', references: 'customers(id)', onDelete: 'CASCADE' },
    technician_id: { type: 'uuid', references: 'users(id)' },
    rating_overall: { type: 'integer', notNull: true }, // 1-5
    rating_technical: { type: 'integer' },
    rating_service: { type: 'integer' },
    rating_price: { type: 'integer' },
    comment: { type: 'text' },
    internal_notes: { type: 'text' },
    store_response: { type: 'text' },
    response_time_seconds: { type: 'integer' },
    sentiment_score: { type: 'varchar(20)' },
    ai_topics: { type: 'jsonb' }, // ['Preço', 'Prazo', 'Qualidade']
    customer_loyalty_level: { type: 'varchar(50)', default: 'Standard' },
    is_public: { type: 'boolean', default: true },
    images: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('system_branding', {
    id: { type: 'serial', primaryKey: true },
    franchise_id: { type: 'varchar(50)', default: 'default', unique: true },
    logo_url: { type: 'text' },
    primary_color: { type: 'varchar(20)', default: '#1976d2' },
    secondary_color: { type: 'varchar(20)', default: '#dc004e' },
    font_family: { type: 'varchar(100)', default: 'Roboto, sans-serif' },
    favicon_url: { type: 'text' },
    app_name: { type: 'varchar(100)', default: 'Redecell PDV' },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('tags', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(50)', notNull: true, unique: true },
    color: { type: 'varchar(20)', default: '#1976d2' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('product_compatibilities', {
    id: { type: 'serial', primaryKey: true },
    brand: { type: 'varchar(100)', notNull: true },
    model: { type: 'varchar(255)', notNull: true },
    compatible_models: { type: 'text[]', notNull: true }, // Array of strings
    category: { type: 'varchar(100)', notNull: true, default: 'Pelicula 3D' },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
  pgm.addIndex('product_compatibilities', ['brand', 'model']);
};

exports.down = (pgm) => {
  pgm.dropTable('system_branding');
  pgm.dropTable('product_compatibilities');
  pgm.dropTable('time_clock_entries');
  pgm.dropTable('product_kit_items');
  pgm.dropTable('product_kits');
  pgm.dropTable('automation_runs');
  pgm.dropTable('automation_steps');
  pgm.dropTable('automations');
  pgm.dropTable('loyalty_transactions');
  pgm.dropTable('loyalty_tiers');
  pgm.dropTable('referrals');
  pgm.dropTable('coupons');
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
  pgm.dropTable('service_order_comments');
  pgm.dropTable('service_order_attachments');
  pgm.dropTable('service_order_items');
  pgm.dropTable('service_order_status_history');
  pgm.dropTable('service_orders');
  pgm.dropTable('return_items');
  pgm.dropTable('returns');
  pgm.dropTable('discounts');
  pgm.dropTable('sale_payments');
  pgm.dropTable('sale_items');
  pgm.dropTable('sales');
  pgm.dropTable('checklist_template_items');
  pgm.dropTable('checklist_templates');
  pgm.dropTable('part_suppliers');
  pgm.dropTable('parts');
  pgm.dropTable('inventory_movements');
  pgm.dropTable('product_stock');
  pgm.dropTable('branch_product_variations_stock');
  pgm.dropTable('product_variations');
  pgm.dropTable('products');
  pgm.dropTable('categories');
  pgm.dropTable('suppliers');
  pgm.dropTable('lead_activities');
  pgm.dropTable('leads');
  pgm.dropTable('branches');
  pgm.dropTable('store_credit_transactions');
  pgm.dropTable('audit_logs');
  pgm.dropTable('user_roles');
  pgm.dropTable('users');
  pgm.dropTable('customers');
  pgm.dropTable('role_permissions');
  pgm.dropTable('permissions');
  pgm.dropTable('roles');
  pgm.dropExtension('uuid-ossp');
};