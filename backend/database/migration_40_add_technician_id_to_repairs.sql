ALTER TABLE repairs
ADD COLUMN IF NOT EXISTS technician_id INT,
ADD CONSTRAINT fk_technician
FOREIGN KEY (technician_id)
REFERENCES technicians(id)
ON DELETE SET NULL;
