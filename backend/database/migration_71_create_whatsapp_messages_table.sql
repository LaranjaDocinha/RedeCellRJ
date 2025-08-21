CREATE TABLE whatsapp_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES whatsapp_conversations(conversation_id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'customer' or 'system'
    message_content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'sent', -- e.g., 'sent', 'delivered', 'read', 'failed'
    direction VARCHAR(10) NOT NULL, -- 'inbound' or 'outbound'
    external_message_id VARCHAR(255), -- ID from WhatsApp API
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add a trigger to update the updated_at column on each update
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON whatsapp_messages
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp();

-- Add index for faster lookup of messages by conversation
CREATE INDEX idx_whatsapp_messages_conversation_id ON whatsapp_messages(conversation_id);