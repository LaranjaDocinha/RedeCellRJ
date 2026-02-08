import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { referralService } from './referralService.js';
import { customerRepository, Customer } from '../repositories/customer.repository.js';

// Interfaces
interface CreateCustomerPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  cpf?: string;
  birth_date?: string;
  referral_code?: string;
}

interface UpdateCustomerPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  cpf?: string;
  birth_date?: string;
}

interface ExtractedCustomerData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  cpf?: string;
}

interface SearchCustomersQuery {
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

interface Customer360View extends Customer {
  recent_sales: Array<{
    id: number;
    total_amount: number;
    sale_date: Date;
  }>;
}

class CustomerService {
  async getAllCustomers(): Promise<Customer[]> {
    return customerRepository.findAll();
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    return customerRepository.findById(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return customerRepository.findByEmail(email);
  }

  async getCustomersWithBirthdayToday(): Promise<Customer[]> {
    return customerRepository.findWithBirthdayToday();
  }

  async createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
    const { name, email, phone, address, cpf, referral_code } = payload;
    try {
      const newCustomer = await customerRepository.create({ name, email, phone, address, cpf });

      if (referral_code) {
        await referralService.applyReferralCode(referral_code, newCustomer.id);
      }

      return newCustomer;
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') {
        throw new AppError('Customer with this email or CPF already exists', 409);
      }
      throw error;
    }
  }

  async updateCustomer(id: string, payload: UpdateCustomerPayload): Promise<Customer | undefined> {
    try {
      const updated = await customerRepository.update(id, payload);
      if (!updated && Object.keys(payload).length > 0) {
        const exists = await customerRepository.findById(id);
        if (!exists) return undefined;
        return exists;
      }
      return updated;
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') {
        throw new AppError('Customer with this email or CPF already exists', 409);
      }
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return customerRepository.delete(id);
  }

  async createOrUpdateCustomerFromOCR(data: ExtractedCustomerData): Promise<Customer> {
    const { name, email, phone, address, cpf } = data;

    let existingCustomer: Customer | undefined;
    if (cpf) {
      existingCustomer = await customerRepository.findByCpf(cpf);
    }
    if (!existingCustomer && email) {
      existingCustomer = await customerRepository.findByEmail(email);
    }

    if (existingCustomer) {
      const updatePayload: UpdateCustomerPayload = { name, email, phone, address, cpf };
      Object.keys(updatePayload).forEach(
        (key) =>
          updatePayload[key as keyof UpdateCustomerPayload] === undefined &&
          delete updatePayload[key as keyof UpdateCustomerPayload],
      );

      return this.updateCustomer(
        existingCustomer.id.toString(),
        updatePayload,
      ) as Promise<Customer>;
    } else {
      if (!name || !email) {
        throw new AppError(
          'Name and email are required to create a new customer from OCR data.',
          400,
        );
      }
      const createPayload: CreateCustomerPayload = { name, email, phone, address, cpf };
      return this.createCustomer(createPayload);
    }
  }

  async getCustomerSegments(): Promise<any[]> {
    return customerRepository.getSegments();
  }

  async searchCustomers(
    query: SearchCustomersQuery,
  ): Promise<{ customers: Customer[]; totalCustomers: number }> {
    const result = await customerRepository.search(query);
    return {
      customers: result.customers,
      totalCustomers: result.total,
    };
  }

  async getCustomer360View(customerId: string): Promise<Customer360View | undefined> {
    const customer = await customerRepository.findById(customerId);

    if (!customer) {
      return undefined;
    }

    const recentSalesResult = await pool.query(
      `SELECT id, total_amount, sale_date FROM sales WHERE customer_id = $1 ORDER BY sale_date DESC LIMIT 5`,
      [customerId],
    );

    return {
      ...customer,
      store_credit_balance: customer.store_credit_balance,
      recent_sales: recentSalesResult.rows.map((r) => ({
        ...r,
        total_amount: parseFloat(r.total_amount),
      })),
    };
  }

  async addLoyaltyPoints(customerId: string, points: number): Promise<Customer | undefined> {
    return customerRepository.updateLoyaltyPoints(customerId, points);
  }

  async subtractLoyaltyPoints(customerId: string, points: number): Promise<Customer | undefined> {
    return customerRepository.updateLoyaltyPoints(customerId, -points);
  }

  async deductStoreCredit(
    customerId: string,
    amount: number,
    relatedId: string | null = null,
    client: any = null,
    reason: string = 'Manual deduction',
  ): Promise<Customer | undefined> {
    const transactionClient = client || (await pool.connect());
    const shouldManageTransaction = !client;

    try {
      if (shouldManageTransaction) await transactionClient.query('BEGIN');

      const customer = await customerRepository.findById(customerId, transactionClient);
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      const currentBalance = parseFloat(customer.store_credit_balance);
      if (currentBalance < amount) {
        throw new AppError('Insufficient store credit balance', 400);
      }

      const updatedCustomer = await customerRepository.updateStoreCredit(
        customerId,
        -amount,
        transactionClient,
      );

      if (updatedCustomer) {
        await customerRepository.logStoreCreditTransaction(
          {
            customer_id: customerId,
            amount: amount,
            type: 'debit',
            reason: reason,
            related_id: relatedId,
          },
          transactionClient,
        );
      }

      if (shouldManageTransaction) await transactionClient.query('COMMIT');
      return updatedCustomer;
    } catch (error) {
      if (shouldManageTransaction) await transactionClient.query('ROLLBACK');
      throw error;
    } finally {
      if (shouldManageTransaction) transactionClient.release();
    }
  }

  async addStoreCredit(
    customerId: string,
    amount: number,
    relatedId: string | null = null,
    client: any = null,
    reason: string = 'Manual adjustment',
  ): Promise<Customer | undefined> {
    const updatedCustomer = await customerRepository.updateStoreCredit(customerId, amount, client);

    if (updatedCustomer) {
      await customerRepository.logStoreCreditTransaction(
        {
          customer_id: customerId,
          amount: amount,
          type: 'credit',
          reason: reason,
          related_id: relatedId,
        },
        client,
      );
    }
    return updatedCustomer;
  }

  async addCashback(
    customerId: string,
    amount: number,
    reason: string = 'Cashback',
    client: any = null,
  ): Promise<Customer | undefined> {
    const transactionClient = client || (await pool.connect());
    const shouldManageTransaction = !client;

    try {
      if (shouldManageTransaction) await transactionClient.query('BEGIN');

      const updatedCustomer = await customerRepository.updateStoreCredit(
        customerId,
        amount,
        transactionClient,
      );

      if (updatedCustomer) {
        await customerRepository.logStoreCreditTransaction(
          {
            customer_id: customerId,
            amount: amount,
            type: 'cashback',
            reason: reason,
          },
          transactionClient,
        );
      }

      if (shouldManageTransaction) await transactionClient.query('COMMIT');
      return updatedCustomer;
    } catch (error) {
      if (shouldManageTransaction) await transactionClient.query('ROLLBACK');
      throw error;
    } finally {
      if (shouldManageTransaction) transactionClient.release();
    }
  }
}

export const customerService = new CustomerService();
