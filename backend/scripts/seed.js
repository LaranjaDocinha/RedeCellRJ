var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as dotenv from 'dotenv';
// Load environment variables from the root .env file
dotenv.config({ path: '../.env' });
import { faker } from '@faker-js/faker';
import pool from '../src/db/index.js';
import * as bcrypt from 'bcrypt';
// Helper function to create bulk insert queries
function createBulkInsertQuery(table, columns, values) {
    const valuePlaceholders = values.map((_, rowIndex) => `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`).join(', ');
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${valuePlaceholders}`;
    return {
        query,
        flatValues: values.flat(),
    };
}
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Iniciando o seeding do banco de dados...');
        try {
            // 1. Limpar tabelas existentes para garantir um estado limpo
            console.log('Limpando tabelas...');
            yield pool.query('TRUNCATE users, products, sales, kanban_cards, loyalty_transactions RESTART IDENTITY CASCADE');
            console.log('Tabelas limpas.');
            // 2. Seed Admin User
            console.log('Criando usuário administrador...');
            const adminPassword = yield bcrypt.hash('admin123', 10);
            yield pool.query('INSERT INTO users (name, email, password, loyalty_points) VALUES ($1, $2, $3, $4)', ['Admin User', 'admin@pdv.com', adminPassword, 0]);
            console.log('Usuário administrador criado.');
            // 3. Seed Fake Users
            const usersToCreate = [];
            const userPassword = yield bcrypt.hash('password123', 10);
            for (let i = 0; i < 10; i++) {
                usersToCreate.push([
                    faker.person.fullName(),
                    faker.internet.email(),
                    userPassword,
                    faker.number.int({ min: 0, max: 1000 }),
                ]);
            }
            const usersQuery = createBulkInsertQuery('users', ['name', 'email', 'password', 'loyalty_points'], usersToCreate);
            yield pool.query(usersQuery.query, usersQuery.flatValues);
            console.log(`Inseridos ${usersToCreate.length} usuários de teste.`);
            // 4. Seed Products
            const productsToCreate = [];
            for (let i = 0; i < 50; i++) {
                productsToCreate.push([
                    faker.commerce.productName(),
                    faker.commerce.productDescription(),
                    parseFloat(faker.commerce.price({ min: 10, max: 2500, dec: 2 })),
                    faker.number.int({ min: 0, max: 200 }),
                ]);
            }
            const productsQuery = createBulkInsertQuery('products', ['name', 'description', 'price', 'stock'], productsToCreate);
            yield pool.query(productsQuery.query, productsQuery.flatValues);
            console.log(`Inseridos ${productsToCreate.length} produtos.`);
            // 5. Seed Sales (with correct total_price)
            const { rows: userRows } = yield pool.query('SELECT id FROM users');
            const { rows: productRows } = yield pool.query('SELECT id, price FROM products');
            const salesToCreate = [];
            for (let i = 0; i < 100; i++) {
                const randomUser = faker.helpers.arrayElement(userRows);
                const randomProduct = faker.helpers.arrayElement(productRows);
                const quantity = faker.number.int({ min: 1, max: 3 });
                const totalPrice = quantity * parseFloat(randomProduct.price);
                salesToCreate.push([
                    randomUser.id,
                    randomProduct.id,
                    quantity,
                    totalPrice.toFixed(2),
                    faker.date.past({ years: 1 }),
                ]);
            }
            const salesQuery = createBulkInsertQuery('sales', ['user_id', 'product_id', 'quantity', 'total_price', 'sale_date'], salesToCreate);
            yield pool.query(salesQuery.query, salesQuery.flatValues);
            console.log(`Inseridas ${salesToCreate.length} vendas.`);
            console.log('\nSeeding principal concluído com sucesso!');
        }
        catch (error) {
            console.error('Erro durante o seeding:', error);
            process.exit(1);
        }
    });
}
function seedKanbanAndLoyalty() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('\nIniciando seeding do Kanban e Loyalty...');
        try {
            // Seed Kanban Cards
            const { rows: columnRows } = yield pool.query('SELECT id FROM kanban_columns');
            if (columnRows.length === 0) {
                console.log('Nenhuma coluna do Kanban encontrada. Pulando seeding de cards.');
                return;
            }
            const cardsToCreate = [];
            for (let i = 0; i < 15; i++) {
                const randomColumn = faker.helpers.arrayElement(columnRows);
                cardsToCreate.push([
                    faker.lorem.sentence(4),
                    faker.lorem.paragraph(2),
                    i, // Simple position
                    randomColumn.id,
                ]);
            }
            const cardsQuery = createBulkInsertQuery('kanban_cards', ['title', 'description', 'position', 'column_id'], cardsToCreate);
            yield pool.query(cardsQuery.query, cardsQuery.flatValues);
            console.log(`Inseridos ${cardsToCreate.length} cards no Kanban.`);
            // Seed Loyalty Transactions
            const { rows: userRows } = yield pool.query('SELECT id FROM users');
            const loyaltyTransactionsToCreate = [];
            const reasons = ['Compra em loja', 'Bônus de aniversário', 'Resgate de prêmio', 'Promoção especial'];
            for (const user of userRows) {
                const transactionCount = faker.number.int({ min: 1, max: 10 });
                for (let i = 0; i < transactionCount; i++) {
                    loyaltyTransactionsToCreate.push([
                        user.id,
                        faker.number.int({ min: -100, max: 100 }), // Can be positive or negative
                        faker.helpers.arrayElement(reasons),
                        faker.date.past({ years: 1 }),
                    ]);
                }
            }
            const loyaltyQuery = createBulkInsertQuery('loyalty_transactions', ['user_id', 'points_change', 'reason', 'created_at'], loyaltyTransactionsToCreate);
            yield pool.query(loyaltyQuery.query, loyaltyQuery.flatValues);
            console.log(`Inseridas ${loyaltyTransactionsToCreate.length} transações de fidelidade.`);
            console.log('Seeding do Kanban e Loyalty concluído com sucesso!');
        }
        catch (error) {
            console.error('Erro durante o seeding do Kanban e Loyalty:', error);
            process.exit(1);
        }
    });
}
function runAllSeeds() {
    return __awaiter(this, void 0, void 0, function* () {
        yield seedDatabase();
        yield seedKanbanAndLoyalty();
        console.log('\nTodos os processos de seeding foram finalizados.');
        yield pool.end();
    });
}
runAllSeeds();
