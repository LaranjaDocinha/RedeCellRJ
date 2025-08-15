-- Adiciona campos de data para controle de prazo na tabela repairs
ALTER TABLE repairs
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS expected_completion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_completion_date TIMESTAMP WITH TIME ZONE;
