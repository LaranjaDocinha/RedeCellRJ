import { parse } from 'ofx-parser';
import fs from 'fs/promises';
import { query } from '../db/index.js';

interface BankTransaction {
  date: Date;
  amount: number;
  description: string;
  transactionId: string;
  type: 'DEBIT' | 'CREDIT';
}

export const parseOfxFile = async (filePath: string): Promise<BankTransaction[]> => {
  const fileContent = await fs.readFile(filePath, 'utf8');
  const data = await parse(fileContent);

  // Navegar na estrutura do OFX (pode variar, assumindo padrão comum)
  // Geralmente: OFX -> BANKMSGSRSV1 -> STMTTRNRS -> STMTRS -> BANKTRANLIST -> STMTTRN
  const transactionsRaw = data.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN || [];

  // Normalizar array (se for um único objeto, o parser pode não retornar array)
  const transactionsList = Array.isArray(transactionsRaw) ? transactionsRaw : [transactionsRaw];

  return transactionsList.map((tx: any) => ({
    date: parseOfxDate(tx.DTPOSTED),
    amount: parseFloat(tx.TRNAMT),
    description: tx.MEMO || tx.NAME,
    transactionId: tx.FITID,
    type: parseFloat(tx.TRNAMT) > 0 ? 'CREDIT' : 'DEBIT',
  }));
};

const parseOfxDate = (dateString: string): Date => {
  // Formato YYYYMMDDHHMMSS...
  const year = parseInt(dateString.substring(0, 4));
  const month = parseInt(dateString.substring(4, 6)) - 1;
  const day = parseInt(dateString.substring(6, 8));
  return new Date(year, month, day);
};

export const findMatches = async (transaction: BankTransaction) => {
  // Tentar encontrar uma venda ou despesa com valor similar e data próxima (+- 3 dias)
  const amount = Math.abs(transaction.amount); // Buscar pelo valor absoluto

  // Buscar Vendas (Se for Crédito)
  let salesMatches: any[] = [];
  if (transaction.type === 'CREDIT') {
    const res = await query(
      `SELECT * FROM sales 
       WHERE total_amount = $1 
       AND sale_date BETWEEN $2::date - INTERVAL '3 days' AND $2::date + INTERVAL '3 days'
       LIMIT 5`,
      [amount, transaction.date],
    );
    salesMatches = res.rows;
  }

  // Buscar Despesas (Se for Débito) - Assumindo tabela 'expenses' ou 'accounts_payable'
  // Vou usar uma query genérica placeholder
  const expenseMatches: any[] = [];
  if (transaction.type === 'DEBIT') {
    // Placeholder: create table expenses if not exists...
    // Por enquanto, retorna vazio
  }

  return {
    transaction,
    matches: {
      sales: salesMatches,
      expenses: expenseMatches,
    },
  };
};

export const reconcile = async (
  _transactionId: string,
  _entityId: number,
  _entityType: 'sale' | 'expense',
) => {
  // Lógica para marcar como conciliado no banco
  // 1. Inserir na tabela bank_transactions
  // 2. Criar link na tabela reconciliation
  // Implementação futura
  return { success: true };
};
