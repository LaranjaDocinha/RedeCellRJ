-- Adiciona campos de data para controle de prazo na tabela repairs
ALTER TABLE repairs
ADD COLUMN start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN expected_completion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN actual_completion_date TIMESTAMP WITH TIME ZONE;
