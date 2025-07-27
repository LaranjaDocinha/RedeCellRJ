ALTER TABLE users DROP CONSTRAINT IF EXISTS role_check;
ALTER TABLE users ADD CONSTRAINT role_check CHECK (role IN ('admin', 'seller'));