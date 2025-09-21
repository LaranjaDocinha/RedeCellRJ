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
  pgm.sql(`
    -- Create the branches table first as other tables depend on it
    CREATE TABLE IF NOT EXISTS branches (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create the products table
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sku VARCHAR(255) UNIQUE NOT NULL,
        product_type VARCHAR(50),
        branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create the product_variations table
    CREATE TABLE IF NOT EXISTS product_variations (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        color VARCHAR(50),
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create the sales table
    CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        total_amount DECIMAL(10, 2) NOT NULL,
        sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create the sale_items table
    CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        variation_id INTEGER NOT NULL REFERENCES product_variations(id),
        quantity INTEGER NOT NULL,
        price_at_sale DECIMAL(10, 2) NOT NULL
    );

    -- Truncate tables to reset the state and restart ID sequences.
    TRUNCATE TABLE branches, products, sales, sale_items RESTART IDENTITY CASCADE;

    -- Insert sample data
    INSERT INTO branches (id, name) VALUES (1, 'Main Branch') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

    INSERT INTO products (id, name, description, sku, product_type, branch_id) VALUES
    (1, 'Laptop Gamer', 'High-end gaming laptop', 'LP-GMR-01', 'physical', 1),
    (2, 'Mouse Sem Fio', 'Ergonomic wireless mouse', 'MS-WRL-02', 'physical', 1),
    (3, 'Teclado Mecânico', 'RGB mechanical keyboard', 'KB-MECH-03', 'physical', 1);

    -- Manually set the sequence to the next value after explicit ID inserts
    SELECT setval('products_id_seq', (SELECT MAX(id) FROM products), true);
    SELECT setval('branches_id_seq', (SELECT MAX(id) FROM branches), true);

    -- Insert corresponding variations for the products.
    INSERT INTO product_variations (product_id, color, price, stock_quantity) VALUES
    (1, 'Black', 7500.00, 10),
    (1, 'White', 7650.50, 5),
    (2, 'Black', 150.50, 100),
    (3, 'Black', 450.75, 50);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS sale_items CASCADE;
    DROP TABLE IF EXISTS sales CASCADE;
    DROP TABLE IF EXISTS product_variations CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS branches CASCADE;
  `);
};
