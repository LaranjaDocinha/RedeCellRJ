-- Tabela para Contas a Pagar
CREATE TABLE IF NOT EXISTS contas_a_pagar (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente', -- pendente, pago, atrasado
    fornecedor_id INTEGER,
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fornecedor_id) REFERENCES customers(id) -- Reaproveitando a tabela de clientes como fornecedores ou criar uma nova
);

-- Tabela para Contas a Receber
CREATE TABLE IF NOT EXISTS contas_a_receber (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_recebimento DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente', -- pendente, recebido, atrasado
    cliente_id INTEGER NOT NULL,
    venda_id INTEGER,
    reparo_id INTEGER,
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES customers(id),
    FOREIGN KEY (venda_id) REFERENCES sales(id),
    FOREIGN KEY (reparo_id) REFERENCES repairs(id)
);

-- Adicionar um campo para controlar o saldo devedor na tabela de clientes
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS saldo_devedor DECIMAL(10, 2) NOT NULL DEFAULT 0.00;


-- Comentário sobre a decisão de usar a tabela customers para fornecedores:
-- Para simplificar o sistema inicial, podemos cadastrar fornecedores como um tipo de cliente.
-- Se a complexidade aumentar, o ideal seria criar uma tabela 'fornecedores' separada.
