-- Adiciona campos de garantia à tabela repairs
ALTER TABLE repairs
ADD COLUMN IF NOT EXISTS warranty_period_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS warranty_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS warranty_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS warranty_status VARCHAR(50) DEFAULT 'N/A';

-- Adiciona índice para otimizar buscas por status de garantia
CREATE INDEX IF NOT EXISTS idx_repairs_warranty_status ON repairs(warranty_status);
