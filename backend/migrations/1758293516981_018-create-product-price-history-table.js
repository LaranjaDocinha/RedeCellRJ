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
  pgm.createTable('product_price_history', {
    id: 'id',
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
    old_price: {
      type: 'decimal(10, 2)',
      notNull: true,
    },
    new_price: {
      type: 'decimal(10, 2)',
      notNull: true,
    },
    changed_at: {
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
  pgm.dropTable('product_price_history');
};
