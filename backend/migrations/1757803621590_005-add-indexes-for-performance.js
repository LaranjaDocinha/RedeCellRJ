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
  pgm.createIndex('sales', 'sale_date');
  pgm.createIndex('sale_items', 'variation_id');
  pgm.createIndex('sale_items', 'product_id');
  pgm.createIndex('sale_items', 'quantity');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropIndex('sales', 'sale_date');
  pgm.dropIndex('sale_items', 'variation_id');
  pgm.dropIndex('sale_items', 'product_id');
  pgm.dropIndex('sale_items', 'quantity');
};
