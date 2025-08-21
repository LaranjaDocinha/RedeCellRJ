CREATE TABLE whatsapp_conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    last_message_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'open', -- e.g., 'open', 'closed', 'pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add a trigger to update the updated_at column on each update
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON whatsapp_conversations
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp();