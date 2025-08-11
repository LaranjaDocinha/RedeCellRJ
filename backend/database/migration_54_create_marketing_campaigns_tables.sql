-- Cria a tabela marketing_campaigns para gerenciar campanhas de marketing (email/sms)
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'Email' ou 'SMS'
    segmentation_criteria JSONB, -- Critérios de segmentação (ex: { "min_purchases": 5, "last_purchase_days": 90 })
    message_template TEXT NOT NULL, -- Conteúdo do e-mail ou SMS
    scheduled_date_time TIMESTAMP WITH TIME ZONE, -- Data/hora agendada para envio
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Scheduled', 'Sent', 'Failed', 'Cancelled'
    created_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria a tabela campaign_recipients para rastrear quem recebeu cada campanha
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Sent', 'Delivered', 'Opened', 'Clicked', 'Failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    external_message_id VARCHAR(255), -- ID da mensagem na API de e-mail/SMS (ex: SendGrid, Twilio)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (campaign_id, customer_id) -- Garante que um cliente não receba a mesma campanha duas vezes
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_scheduled_date ON marketing_campaigns(scheduled_date_time);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_customer_id ON campaign_recipients(customer_id);
