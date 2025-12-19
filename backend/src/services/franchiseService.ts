import { getPool } from '../db/index.js';

export const createFranchise = async (
  name: string,
  address?: string,
  contactPerson?: string,
  contactEmail?: string,
) => {
  const result = await getPool().query(
    'INSERT INTO franchises (name, address, contact_person, contact_email) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, address, contactPerson, contactEmail],
  );
  return result.rows[0];
};

export const updateFranchiseStatus = async (id: number, isActive: boolean) => {
  const result = await getPool().query(
    'UPDATE franchises SET is_active = $1 WHERE id = $2 RETURNING *',
    [isActive, id],
  );
  return result.rows[0];
};

export const deleteFranchise = async (id: number) => {
  const result = await getPool().query('DELETE FROM franchises WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

export const getFranchises = async () => {
  const result = await getPool().query('SELECT * FROM franchises ORDER BY created_at DESC');
  return result.rows;
};

export const getConsolidatedReports = async () => {
  console.log('Simulating fetching consolidated reports across franchises.');
  // In a real scenario, this would aggregate data from multiple franchises.
  return { success: true, message: 'Consolidated reports (simulated).' };
};

export const getFranchiseSettings = async (franchiseId: number) => {
  console.log(`Simulating fetching settings for franchise ${franchiseId}.`);
  // In a real scenario, this would fetch specific settings for a given franchise.
  return {
    success: true,
    message: `Settings for franchise ${franchiseId} (simulated).`,
    settings: { theme: 'default', currency: 'BRL' },
  };
};
