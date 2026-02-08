import { PoolClient } from 'pg';
import pool from '../db/index.js';
import { logger } from './logger.js';

/**
 * Utilitário para gerenciar transações de banco de dados de forma segura e consistente.
 * Garante que conexões sejam sempre liberadas, mesmo em caso de erro.
 */
export const transactionManager = {
  /**
   * Executa uma função dentro de uma transação de banco de dados.
   * @param callback Função que recebe o client da transação.
   */
  async run<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction rolled back due to error:', error);
      throw error;
    } finally {
      client.release();
    }
  },
};
