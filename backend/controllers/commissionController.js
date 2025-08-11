const db = require('../db');
const { logActivity } = require('../utils/activityLogger');

// Calcular comissão para um usuário em um período
exports.calculateCommission = async (req, res) => {
  const { user_id, start_date, end_date } = req.query;

  if (!user_id || !start_date || !end_date) {
    return res.status(400).json({ message: 'ID do usuário, data de início e data de fim são obrigatórios.' });
  }

  try {
    const userResult = await db.query('SELECT u.id, u.name, u.role_id, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const user = userResult.rows[0];

    const rulesResult = await db.query(
      'SELECT * FROM commission_rules WHERE role_id = $1 AND (start_date <= $2 OR start_date IS NULL) AND (end_date >= $3 OR end_date IS NULL) ORDER BY created_at DESC;',
      [user.role_id, end_date, start_date]
    );
    const commissionRules = rulesResult.rows;

    // Fetch all relevant sales data once
    const allSalesData = await db.query(
      `SELECT
        s.id as sale_id,
        s.total_amount,
        si.quantity,
        si.unit_price,
        pv.cost_price,
        p.product_type
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE s.user_id = $1 AND s.sale_date >= $2 AND s.sale_date <= $3;`,
      [user_id, start_date, end_date]
    );

    // Fetch all relevant repairs data once
    const allRepairsData = await db.query(
      `SELECT
        r.id,
        r.final_cost
      FROM repairs r
      WHERE r.technician_id = $1 AND r.status = 'Finalizado' AND r.updated_at >= $2 AND r.updated_at <= $3;`,
      [user_id, start_date, end_date]
    );

    let totalCommission = 0;
    const commissionDetails = [];

    for (const rule of commissionRules) {
      if (rule.applies_to === 'sales' && rule.commission_type === 'percentage_of_sale') {
        const salesAmount = allSalesData.rows.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
        const commission = salesAmount * parseFloat(rule.value);
        totalCommission += commission;
        commissionDetails.push({ rule: rule.commission_type, applies_to: rule.applies_to, amount: commission, base_value: salesAmount });
      } else if (rule.applies_to === 'repairs' && rule.commission_type === 'fixed_per_service') {
        const numberOfRepairs = allRepairsData.rows.length;
        const commission = numberOfRepairs * parseFloat(rule.value);
        totalCommission += commission;
        commissionDetails.push({ rule: rule.commission_type, applies_to: rule.applies_to, amount: commission, base_value: numberOfRepairs });
      } else if (rule.applies_to === 'sales' && rule.commission_type === 'percentage_of_gross_profit') {
        const grossProfit = allSalesData.rows.reduce((sum, item) => {
          const itemGrossProfit = (parseFloat(item.unit_price) - parseFloat(item.cost_price)) * item.quantity;
          return sum + itemGrossProfit;
        }, 0);
        const commission = grossProfit * parseFloat(rule.value);
        totalCommission += commission;
        commissionDetails.push({ rule: rule.commission_type, applies_to: rule.applies_to, amount: commission, base_value: grossProfit });
      } else if (rule.applies_to === 'sales' && rule.commission_type === 'fixed_per_service_type') {
        const numberOfServices = allSalesData.rows.filter(item => item.product_type === 'service').reduce((sum, item) => sum + item.quantity, 0);
        const commission = numberOfServices * parseFloat(rule.value);
        totalCommission += commission;
        commissionDetails.push({ rule: rule.commission_type, applies_to: rule.applies_to, amount: commission, base_value: numberOfServices });
      }
      // Adicionar outras lógicas de cálculo de comissão conforme necessário
    }

    res.json({
      user_id: user.id,
      user_name: user.name,
      role_name: user.role_name,
      period: `${start_date} a ${end_date}`,
      total_commission: parseFloat(totalCommission.toFixed(2)),
      details: commissionDetails,
    });
  } catch (error) {
    console.error('Erro ao calcular comissão:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};


// Registrar pagamento de comissão
exports.recordCommissionPayout = async (req, res) => {
  const { user_id, amount, period_start, period_end, notes } = req.body;
  const created_by_user_id = req.user.id;

  if (!user_id || amount === undefined || amount <= 0 || !period_start || !period_end) {
    return res.status(400).json({ message: 'Dados do pagamento de comissão incompletos ou inválidos.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO commission_payouts (user_id, amount, period_start, period_end, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [user_id, amount, period_start, period_end, notes || null]
    );
    const payout = result.rows[0];

    await logActivity(req.user.name, `Pagamento de comissão de R${amount} registrado para o usuário #${user_id}.`, 'commission_payout', payout.id);

    res.status(201).json(payout);
  } catch (error) {
    console.error('Erro ao registrar pagamento de comissão:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Obter comissões calculadas para um usuário em um período
exports.getCalculatedCommissions = async (req, res) => {
  const { user_id, start_date, end_date } = req.query;

  if (!user_id || !start_date || !end_date) {
    return res.status(400).json({ message: 'ID do usuário, data de início e data de fim são obrigatórios.' });
  }

  try {
    // Reutiliza a lógica de calculateCommission
    const userResult = await db.query('SELECT u.id, u.name, u.role_id, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const user = userResult.rows[0];

    const rulesResult = await db.query(
      'SELECT * FROM commission_rules WHERE role_id = $1 AND (start_date <= $2 OR start_date IS NULL) AND (end_date >= $3 OR end_date IS NULL) ORDER BY created_at DESC;',
      [user.role_id, end_date, start_date]
    );
    const commissionRules = rulesResult.rows;

    let totalCommission = 0;
    const commissionDetails = [];

    for (const rule of commissionRules) {
      if (rule.applies_to === 'sales' && rule.commission_type === 'percentage_of_sale') {
        const salesResult = await db.query(
          'SELECT s.id, s.total_amount FROM sales s WHERE s.user_id = $1 AND s.sale_date >= $2 AND s.sale_date <= $3;',
          [user_id, start_date, end_date]
        );
        const salesAmount = salesResult.rows.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
        const commission = salesAmount * parseFloat(rule.value);
        totalCommission += commission;
        commissionDetails.push({ rule: rule.commission_type, applies_to: rule.applies_to, amount: commission, base_value: salesAmount });
      } else if (rule.applies_to === 'repairs' && rule.commission_type === 'fixed_per_service') {
        const repairsResult = await db.query(
          'SELECT r.id, r.final_cost FROM repairs r WHERE r.technician_id = $1 AND r.status = \'Finalizado\' AND r.updated_at >= $2 AND r.updated_at <= $3;',
          [user_id, start_date, end_date]
        );
        const numberOfRepairs = repairsResult.rows.length;
        const commission = numberOfRepairs * parseFloat(rule.value);
        totalCommission += commission;
        commissionDetails.push({ rule: rule.commission_type, applies_to: rule.applies_to, amount: commission, base_value: numberOfRepairs });
      }
      // Adicionar outras lógicas de cálculo de comissão conforme necessário
    }

    res.json({
      user_id: user.id,
      user_name: user.name,
      role_name: user.role_name,
      period: `${start_date} a ${end_date}`,
      total_commission: parseFloat(totalCommission.toFixed(2)),
      details: commissionDetails,
    });
  } catch (error) {
    console.error('Erro ao calcular comissão:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};


// Obter todos os pagamentos de comissão
exports.getAllCommissionPayouts = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT cp.*, u.name as user_name FROM commission_payouts cp JOIN users u ON cp.user_id = u.id ORDER BY payout_date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar pagamentos de comissão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter um pagamento de comissão por ID
exports.getCommissionPayoutById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT cp.*, u.name as user_name FROM commission_payouts cp JOIN users u ON cp.user_id = u.id WHERE cp.id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pagamento de comissão não encontrado.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Erro ao buscar pagamento de comissão ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar um pagamento de comissão
exports.updateCommissionPayout = async (req, res) => {
  const { id } = req.params;
  const { user_id, amount, payout_date, period_start, period_end, notes } = req.body;

  try {
    const result = await db.query(
      'UPDATE commission_payouts SET user_id = $1, amount = $2, payout_date = $3, period_start = $4, period_end = $5, notes = $6 WHERE id = $7 RETURNING *;',
      [user_id, amount, payout_date, period_start, period_end, notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pagamento de comissão não encontrado.' });
    }

    await logActivity(req.user.name, `Pagamento de comissão #${id} atualizado.`, 'commission_payout', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao atualizar pagamento de comissão ${id}:`, error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Deletar um pagamento de comissão
exports.deleteCommissionPayout = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM commission_payouts WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Pagamento de comissão não encontrado.' });
    }

    await logActivity(req.user.name, `Pagamento de comissão #${id} deletado.`, 'commission_payout', id);
    res.status(204).send();
  } catch (error) {
    console.error(`Erro ao deletar pagamento de comissão ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};