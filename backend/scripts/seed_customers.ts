import pg from 'pg';
import { faker } from '@faker-js/faker';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pdv_web',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function seedCustomers() {
  const client = await pool.connect();
  try {
    console.log('Seeding Customers...');
    await client.query('BEGIN');

    for (let i = 0; i < 10; i++) {
        const name = faker.person.fullName();
        const email = faker.internet.email();
        const phone = faker.phone.number();
        const cpf = faker.number.int({ min: 10000000000, max: 99999999999 }).toString(); // Mock CPF

        await client.query(
            'INSERT INTO customers (name, email, phone, cpf, address) VALUES ($1, $2, $3, $4, $5)',
            [name, email, phone, cpf, faker.location.streetAddress()]
        );
    }
    
    // Add a known customer for easy testing
    await client.query(
        "INSERT INTO customers (id, name, email, phone, cpf, address) VALUES (999, 'Cliente Teste', 'teste@cliente.com', '21999999999', '12345678901', 'Rua Teste, 123') ON CONFLICT (id) DO NOTHING"
    );

    await client.query('COMMIT');
    console.log('Customers seeded successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding customers:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seedCustomers();
