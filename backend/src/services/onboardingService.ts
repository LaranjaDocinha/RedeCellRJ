import { getPool } from '../db/index.js';

export const getChecklists = async () => {
  const result = await getPool().query('SELECT * FROM onboarding_checklists');
  return result.rows;
};

export const getChecklist = async (id: number) => {
  const checklistRes = await getPool().query('SELECT * FROM onboarding_checklists WHERE id = $1', [
    id,
  ]);
  const itemsRes = await getPool().query(
    'SELECT * FROM onboarding_checklist_items WHERE checklist_id = $1 ORDER BY item_order',
    [id],
  );
  return { ...checklistRes.rows[0], items: itemsRes.rows };
};

export const assignChecklistToUser = async (userId: string, checklistId: number) => {
  const itemsRes = await getPool().query(
    'SELECT id FROM onboarding_checklist_items WHERE checklist_id = $1',
    [checklistId],
  );
  const items = itemsRes.rows;

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      await client.query(
        'INSERT INTO employee_onboarding_status (user_id, checklist_id, item_id) VALUES ($1, $2, $3)',
        [userId, checklistId, item.id],
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const getEmployeeOnboardingProgress = async (userId: string) => {
  const result = await getPool().query(
    `
    SELECT 
      oc.id as checklist_id, oc.name as checklist_name,
      oci.id as item_id, oci.item_name, oci.item_order,
      eos.completed, eos.completed_at
    FROM employee_onboarding_status eos
    JOIN onboarding_checklists oc ON eos.checklist_id = oc.id
    JOIN onboarding_checklist_items oci ON eos.item_id = oci.id
    WHERE eos.user_id = $1
    ORDER BY oci.item_order
  `,
    [userId],
  );
  return result.rows;
};

export const markItemAsComplete = async (userId: string, itemId: number) => {
  const result = await getPool().query(
    'UPDATE employee_onboarding_status SET completed = true, completed_at = NOW() WHERE user_id = $1 AND item_id = $2 RETURNING *',
    [userId, itemId],
  );
  return result.rows[0];
};
