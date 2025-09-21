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
  pgm.createTable('purchase_order_items', {
    id: 'id',
    purchase_order_id: {
      type: 'integer',
      notNull: true,
      references: 'purchase_orders',
      onDelete: 'CASCADE',
    },
    product_id: {
      type: 'integer',
      notNull: true,
      references: 'products',
      onDelete: 'CASCADE',
    },
    variation_id: {
      type: 'integer',
      notNull: true,
      references: 'product_variations',
      onDelete: 'CASCADE',
    },
    quantity: {
      type: 'integer',
      notNull: true,
    },
    unit_price: {
      type: 'decimal(10, 2)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('purchase_order_items');
};
