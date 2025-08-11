-- Adiciona campos para assinatura digital na tabela repairs
ALTER TABLE repairs
ADD COLUMN IF NOT EXISTS quotation_signature_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS handover_signature_url VARCHAR(255);

-- Adiciona índices para otimizar buscas por assinaturas
CREATE INDEX IF NOT EXISTS idx_repairs_quotation_signature_url ON repairs(quotation_signature_url);
CREATE INDEX IF NOT EXISTS idx_repairs_handover_signature_url ON repairs(handover_signature_url);
