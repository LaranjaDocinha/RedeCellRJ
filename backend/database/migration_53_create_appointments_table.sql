-- Cria a tabela appointments para agendamento online de atendimentos/reparos
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    service_type VARCHAR(100) NOT NULL, -- Ex: 'Repair', 'Consultation', 'Diagnostic'
    appointment_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Cancelled', 'Completed'
    technician_id INTEGER REFERENCES technicians(id) ON DELETE SET NULL, -- Técnico atribuído (opcional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_technician_id ON appointments(technician_id);
