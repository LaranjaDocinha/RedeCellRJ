import { customerService } from '../../src/services/customerService';
import { vi } from 'vitest';
// Mock ../db/index.js
vi.mock('../../src/db/index.js', () => {
    const mockQuery = vi.fn();
    const mockClient = {
        query: vi.fn(),
        release: vi.fn(),
        begin: vi.fn(),
        commit: vi.fn(),
        rollback: vi.fn(),
    };
    const mockPool = {
        query: mockQuery,
        connect: vi.fn(() => Promise.resolve(mockClient)),
    };
    return {
        __esModule: true,
        default: mockPool,
        query: mockQuery,
    };
});
describe('customerService', () => {
    let mockedDb; // Declare mockedDb here
    beforeAll(async () => {
        // Dynamically import mocked modules
        mockedDb = vi.mocked(await import('../../src/db/index.js'));
    });
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear specific mock implementations if needed for specific tests
        mockedDb.default.query.mockClear(); // Corrected
        mockedDb.default.query.mockClear(); // Clear mock for pool.query
        mockedDb.default.connect.mockClear(); // Clear mock for pool.connect
    });
    describe('getAllCustomers', () => {
        it('should return a list of customers', async () => {
            const mockCustomers = [
                { id: 1, name: 'Customer A', email: 'a@example.com' },
                { id: 2, name: 'Customer B', email: 'b@example.com' },
            ];
            mockedDb.default.query.mockResolvedValueOnce({ rows: mockCustomers }); // Corrected
            const customers = await customerService.getAllCustomers();
            expect(customers).toEqual(mockCustomers);
            expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM customers'); // Corrected
        });
        it('should return an empty array if no customers are found', async () => {
            mockedDb.default.query.mockResolvedValueOnce({ rows: [] }); // Corrected
            const customers = await customerService.getAllCustomers();
            expect(customers).toEqual([]);
            expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM customers'); // Corrected
        });
    });
    describe('getCustomerById', () => {
        it('should return customer data for a valid ID', async () => {
            const mockCustomer = { id: 1, name: 'Customer A', email: 'a@example.com' };
            mockedDb.default.query.mockResolvedValueOnce({ rows: [mockCustomer] }); // Corrected
            const customer = await customerService.getCustomerById(1);
            expect(customer).toEqual(mockCustomer);
            expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM customers WHERE id = $1', [
                1,
            ]); // Corrected
        });
        it('should return undefined if no customer is found for the given ID', async () => {
            mockedDb.default.query.mockResolvedValueOnce({ rows: [] }); // Corrected
            const customer = await customerService.getCustomerById(999);
            expect(customer).toBeUndefined();
            expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM customers WHERE id = $1', [
                999,
            ]); // Corrected
        });
    });
    describe('getCustomerByEmail', () => {
        it('should return customer data for a valid email', async () => {
            const mockCustomer = { id: 1, name: 'Customer A', email: 'a@example.com' };
            mockedDb.default.query.mockResolvedValueOnce({ rows: [mockCustomer] });
            const customer = await customerService.getCustomerByEmail('a@example.com');
            expect(customer).toEqual(mockCustomer);
            expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM customers WHERE email = $1', ['a@example.com']);
        });
        it('should return undefined if no customer is found for the given email', async () => {
            mockedDb.default.query.mockResolvedValueOnce({ rows: [] });
            const customer = await customerService.getCustomerByEmail('nonexistent@example.com');
            expect(customer).toBeUndefined();
            expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM customers WHERE email = $1', ['nonexistent@example.com']);
        });
    });
    describe('createCustomer', () => {
        it('should successfully create a customer and return the new customer data', async () => {
            const newCustomerData = { name: 'New Customer', email: 'new@example.com' };
            const createdCustomer = { id: 3, ...newCustomerData };
            mockedDb.default.query.mockResolvedValueOnce({ rows: [createdCustomer] }); // Corrected
            const customer = await customerService.createCustomer(newCustomerData);
            expect(customer).toEqual(createdCustomer);
            expect(mockedDb.default.query).toHaveBeenCalledWith(
            // Corrected
            'INSERT INTO customers (name, email, phone, address, cpf, birth_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', ['New Customer', 'new@example.com', undefined, undefined, undefined, undefined]);
        });
        it('should create a customer with all fields', async () => {
            const newCustomerData = {
                name: 'Full Customer',
                email: 'full@example.com',
                phone: '12345',
                address: '123 Main St',
                cpf: '123.456.789-00',
                birth_date: '1990-01-01',
            };
            const createdCustomer = { id: 4, ...newCustomerData };
            mockedDb.default.query.mockResolvedValueOnce({ rows: [createdCustomer] }); // Corrected
            const customer = await customerService.createCustomer(newCustomerData);
            expect(customer).toEqual(createdCustomer);
            expect(mockedDb.default.query).toHaveBeenCalledWith(
            // Corrected
            'INSERT INTO customers (name, email, phone, address, cpf, birth_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [
                'Full Customer',
                'full@example.com',
                '12345',
                '123 Main St',
                '123.456.789-00',
                '1990-01-01',
            ]);
        });
        it('should throw an error if the database query fails', async () => {
            const newCustomerData = { name: 'Error Customer', email: 'error@example.com' };
            const dbError = new Error('DB error');
            mockedDb.default.query.mockRejectedValueOnce(dbError);
            await expect(customerService.createCustomer(newCustomerData)).rejects.toThrow(dbError);
        });
    });
    describe('updateCustomer', () => {
        const existingCustomer = {
            id: 1,
            name: 'Customer A',
            email: 'a@example.com',
            created_at: new Date(),
            updated_at: new Date(),
        };
        it('should successfully update a customer with partial data', async () => {
            const updatedData = { email: 'updated@example.com' };
            const updatedCustomer = { ...existingCustomer, ...updatedData };
            mockedDb.default.query.mockResolvedValueOnce({ rows: [updatedCustomer] }); // Mock for UPDATE query
            const customer = await customerService.updateCustomer(1, updatedData);
            expect(customer).toEqual(updatedCustomer);
            expect(mockedDb.default.query).toHaveBeenCalledWith('UPDATE customers SET email = $1, updated_at = current_timestamp WHERE id = $2 RETURNING *', ['updated@example.com', 1]);
        });
        it('should successfully update a customer with all data', async () => {
            const updatedData = {
                name: 'Updated Name',
                email: 'updated@example.com',
                phone: '98765',
                address: 'New Address',
            };
            const updatedCustomer = { ...existingCustomer, ...updatedData };
            mockedDb.default.query.mockResolvedValueOnce({ rows: [updatedCustomer] }); // Mock for UPDATE query
            const customer = await customerService.updateCustomer(1, updatedData);
            expect(customer).toEqual(updatedCustomer);
            expect(mockedDb.default.query).toHaveBeenCalledWith('UPDATE customers SET name = $1, email = $2, phone = $3, address = $4, updated_at = current_timestamp WHERE id = $5 RETURNING *', ['Updated Name', 'updated@example.com', '98765', 'New Address', 1]);
        });
        it('should return the existing customer if no data is provided for update', async () => {
            mockedDb.default.query.mockResolvedValueOnce({ rows: [existingCustomer] }); // For getCustomerById
            const customer = await customerService.updateCustomer(1, {});
            expect(customer).toEqual(existingCustomer);
            expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM customers WHERE id = $1', [
                1,
            ]);
            expect(mockedDb.default.query).toHaveBeenCalledTimes(1); // Only getCustomerById should be called
        });
        it('should throw an AppError for unique constraint violation', async () => {
            const updatedData = { email: 'existing@example.com' };
            const dbError = new Error('unique constraint violation');
            dbError.code = '23505';
            mockedDb.default.query.mockRejectedValueOnce(dbError);
            await expect(customerService.updateCustomer(1, updatedData)).rejects.toThrow('Customer with this email or CPF already exists');
        });
    });
    describe('deleteCustomer', () => {
        it('should successfully delete a customer', async () => {
            mockedDb.default.query.mockResolvedValueOnce({ rowCount: 1 }); // Simulate one row being affected
            const result = await customerService.deleteCustomer(1);
            expect(result).toBe(true);
            expect(mockedDb.default.query).toHaveBeenCalledWith('DELETE FROM customers WHERE id = $1 RETURNING id', [1]);
        });
        it('should return false if no customer is found for deletion', async () => {
            mockedDb.default.query.mockResolvedValueOnce({ rowCount: 0, rows: [] }); // Corrected
            const result = await customerService.deleteCustomer(999);
            expect(result).toBe(false);
            expect(mockedDb.default.query).toHaveBeenCalledWith('DELETE FROM customers WHERE id = $1 RETURNING id', [999]); // Corrected
        });
    });
    describe('createOrUpdateCustomerFromOCR', () => {
        const ocrData = { name: 'OCR User', email: 'ocr@example.com', cpf: '111.111.111-11' };
        it('should create a new customer if not found', async () => {
            mockedDb.default.query.mockResolvedValueOnce({ rows: [] }); // Find by CPF
            mockedDb.default.query.mockResolvedValueOnce({ rows: [] }); // Find by email
            mockedDb.default.query.mockResolvedValueOnce({ rows: [{ id: 5, ...ocrData }] }); // Create
            const customer = await customerService.createOrUpdateCustomerFromOCR(ocrData);
            expect(customer).toBeDefined();
            expect(customer.name).toBe(ocrData.name);
            expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM customers WHERE cpf = $1', [ocrData.cpf]);
            expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM customers WHERE email = $1', [ocrData.email]);
            expect(mockedDb.default.query).toHaveBeenCalledWith('INSERT INTO customers (name, email, phone, address, cpf, birth_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [ocrData.name, ocrData.email, undefined, undefined, ocrData.cpf, undefined]);
        });
        it('should update an existing customer found by CPF', async () => {
            const existingCustomer = {
                id: 6,
                name: 'Old Name',
                email: 'old@example.com',
                cpf: '111.111.111-11',
            };
            mockedDb.default.query.mockResolvedValueOnce({ rows: [existingCustomer] }); // Find by CPF
            mockedDb.default.query.mockResolvedValueOnce({ rows: [{ id: 6, ...ocrData }] }); // Update
            const customer = await customerService.createOrUpdateCustomerFromOCR(ocrData);
            expect(customer).toBeDefined();
            expect(customer.name).toBe(ocrData.name);
            expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM customers WHERE cpf = $1', [ocrData.cpf]);
            expect(mockedDb.default.query).toHaveBeenCalledWith('UPDATE customers SET name = $1, email = $2, cpf = $3, updated_at = current_timestamp WHERE id = $4 RETURNING *', [ocrData.name, ocrData.email, ocrData.cpf, existingCustomer.id]);
        });
        it('should update an existing customer found by email', async () => {
            const existingCustomer = {
                id: 7,
                name: 'Old Name',
                email: 'ocr@example.com',
                cpf: '222.222.222-22',
            };
            mockedDb.default.query.mockResolvedValueOnce({ rows: [] }); // Find by CPF
            mockedDb.default.query.mockResolvedValueOnce({ rows: [existingCustomer] }); // Find by email
            mockedDb.default.query.mockResolvedValueOnce({ rows: [{ id: 7, ...ocrData }] }); // Update
            const customer = await customerService.createOrUpdateCustomerFromOCR(ocrData);
            expect(customer).toBeDefined();
            expect(customer.name).toBe(ocrData.name);
            expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM customers WHERE cpf = $1', [ocrData.cpf]);
            expect(mockedDb.default.query).toHaveBeenCalledWith('SELECT * FROM customers WHERE email = $1', [ocrData.email]);
            expect(mockedDb.default.query).toHaveBeenCalledWith('UPDATE customers SET name = $1, email = $2, cpf = $3, updated_at = current_timestamp WHERE id = $4 RETURNING *', [ocrData.name, ocrData.email, ocrData.cpf, existingCustomer.id]);
        });
        it('should throw an error if name is missing for new customer', async () => {
            mockedDb.default.query.mockResolvedValue({ rows: [] });
            const incompleteOcrData = { email: 'no-name@example.com' };
            await expect(customerService.createOrUpdateCustomerFromOCR(incompleteOcrData)).rejects.toThrow('Name and email are required to create a new customer from OCR data.');
        });
    });
    describe('getCustomerSegments', () => {
        it('should return customer segments', async () => {
            const mockSegments = [
                { rfm_segment: 'Champions', customer_count: '10' },
                { rfm_segment: 'Loyal Customers', customer_count: '25' },
            ];
            mockedDb.default.query.mockResolvedValueOnce({ rows: mockSegments });
            const segments = await customerService.getCustomerSegments();
            expect(segments).toEqual([
                { rfm_segment: 'Champions', customer_count: 10 },
                { rfm_segment: 'Loyal Customers', customer_count: 25 },
            ]);
            expect(mockedDb.default.query).toHaveBeenCalledWith(expect.stringContaining('SELECT\n        rfm_segment,\n        COUNT(id) AS customer_count'));
        });
    });
});
