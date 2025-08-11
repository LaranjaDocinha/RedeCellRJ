-- Cria a tabela bank_accounts para gerenciar contas bancárias
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(255) NOT NULL UNIQUE,
    initial_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    current_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Será atualizado por transações
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria a tabela bank_transactions para registrar transações bancárias
CREATE TABLE IF NOT EXISTS bank_transactions (
    id SERIAL PRIMARY KEY,
    bank_account_id INTEGER NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'credit' ou 'debit'
    external_id VARCHAR(255) UNIQUE, -- ID da transação no extrato bancário (se disponível)
    reconciled BOOLEAN NOT NULL DEFAULT FALSE,
    reconciled_with_id INTEGER, -- ID da transação interna (ex: sale_id, expense_id, payout_id)
    reconciled_with_type VARCHAR(50), -- Tipo da transação interna (ex: 'sale', 'expense', 'payout')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_bank_accounts_account_number ON bank_accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account_id ON bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_reconciled ON bank_transactions(reconciled);
