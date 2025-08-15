-- Fase 1: Criar as novas tabelas para o sistema de templates de checklist

-- Tabela para armazenar os modelos/templates de checklist
CREATE TABLE IF NOT EXISTS checklist_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    -- O tipo pode ser usado para sugerir checklists (ex: para uma categoria de produto)
    category VARCHAR(100), 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar os itens/perguntas de cada template
CREATE TABLE IF NOT EXISTS checklist_template_items (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    -- Define o tipo de resposta esperada: 'boolean' para sim/não, 'text' para texto livre
    response_type VARCHAR(50) NOT NULL DEFAULT 'boolean', 
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de instância: vincula um reparo a um template de checklist específico
-- Um reparo pode ter múltiplas instâncias (ex: uma de entrada e uma de saída)
CREATE TABLE IF NOT EXISTS repair_checklist_instances (
    id SERIAL PRIMARY KEY,
    repair_id INTEGER NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES checklist_templates(id),
    -- 'pre-repair' ou 'post-repair' para distinguir a fase do checklist
    type VARCHAR(50) NOT NULL, 
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
    completed_by_user_id INTEGER REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar as respostas de cada item de uma instância de checklist
CREATE TABLE IF NOT EXISTS repair_checklist_answers (
    id SERIAL PRIMARY KEY,
    instance_id INTEGER NOT NULL REFERENCES repair_checklist_instances(id) ON DELETE CASCADE,
    template_item_id INTEGER NOT NULL REFERENCES checklist_template_items(id) ON DELETE CASCADE,
    answer_boolean BOOLEAN,
    answer_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar índices para otimizar as consultas
CREATE INDEX IF NOT EXISTS idx_checklist_template_items_template_id ON checklist_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_repair_checklist_instances_repair_id ON repair_checklist_instances(repair_id);
CREATE INDEX IF NOT EXISTS idx_repair_checklist_answers_instance_id ON repair_checklist_answers(instance_id);

-- Comentário sobre a tabela antiga:
-- A tabela 'repair_checklists' da migração 28 será descontinuada e removida em uma futura migração
-- após a migração dos dados, se necessário. As novas funcionalidades usarão esta nova estrutura.
