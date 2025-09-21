/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('purchase_orders', {
    id: 'id',
    supplier_id: {
      type: 'integer',
      notNull: true,
      references: 'suppliers',
      onDelete: 'RESTRICT', // Prevent deleting supplier if there are associated purchase orders
    },
    order_date: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    expected_delivery_date: { type: 'timestamp', notNull: false },
    status: { type: 'varchar(50)', notNull: true, default: 'pending' },
    total_amount: { type: 'decimal(10, 2)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('purchase_orders');
};
