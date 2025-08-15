const pool = require('../db');
const { AppError, NotFoundError } = require('../utils/appError');

// @desc    Obter todos os reparos agrupados por status
// @route   GET /api/repairs/by-status
// @access  Private
exports.getAllRepairsByStatus = async (req, res, next) => {
  try {
    const { technician_id } = req.query;
    const queryParams = [];
    let whereClause = '';
    let paramIndex = 1;

    if (technician_id) {
      whereClause = `WHERE r.technician_id = $${paramIndex++}`;
      queryParams.push(technician_id);
    }

    const query = `
      SELECT 
        r.id, r.customer_id, c.name as customer_name, r.device_type, r.model, r.imei_serial, r.problem_description, r.status, r.priority,
        r.start_date, r.expected_completion_date, r.actual_completion_date, r.technician_id, t.name as technician_name,
        r.warranty_status, r.quotation_signature_url, r.handover_signature_url
      FROM repairs r
      JOIN customers c ON r.customer_id = c.id
      LEFT JOIN technicians t ON r.technician_id = t.id
      ${whereClause}
      ORDER BY r.priority DESC, r.created_at ASC;
    `;

    const { rows: repairs } = await pool.query(query, queryParams);

    // Agrupar reparos por status
    const repairsByStatus = repairs.reduce((acc, repair) => {
      if (!acc[repair.status]) {
        acc[repair.status] = [];
      }
      acc[repair.status].push(repair);
      return acc;
    }, {});

    res.status(200).json(repairsByStatus);
  } catch (error) {
    next(new AppError('Erro ao buscar reparos por status.', 500));
  }
};

// @desc    Atualizar o status de um reparo
// @route   PATCH /api/repairs/:id/status
// @access  Private
exports.updateRepairStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validação básica de status (pode ser mais robusta com um ENUM ou lista permitida)
    const allowedStatuses = ['Orçamento pendente', 'Aguardando aprovação', 'Em andamento', 'Aguardando peça', 'Pronto para entrega', 'Entregue', 'Cancelado'];
    if (!allowedStatuses.includes(status)) {
      return next(new AppError('Status inválido fornecido.', 400));
    }

    const { rows } = await pool.query(
      'UPDATE repairs SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *;',
      [status, id]
    );

    if (rows.length === 0) {
      return next(new AppError('Reparo não encontrado para atualização de status.', 404));
    }

    res.status(200).json({
      message: 'Status do reparo atualizado com sucesso!',
      repair: rows[0]
    });
  } catch (error) {
    next(new AppError('Erro ao atualizar status do reparo.', 500));
  }
};

// @desc    Atribuir um técnico a um reparo
// @route   PATCH /api/repairs/:id/assign-technician
// @access  Private
exports.assignTechnician = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { technician_id } = req.body; // Pode ser null para desatribuir

    // Opcional: validar se technician_id existe na tabela technicians
    if (technician_id !== null) {
      const techExists = await pool.query('SELECT id FROM technicians WHERE id = $1', [technician_id]);
      if (techExists.rows.length === 0) {
        return next(new AppError('Técnico não encontrado.', 404));
      }
    }

    const { rows } = await pool.query(
      'UPDATE repairs SET technician_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *;',
      [technician_id, id]
    );

    if (rows.length === 0) {
      return next(new AppError('Reparo não encontrado para atribuição de técnico.', 404));
    }

    res.status(200).json({
      message: 'Técnico atribuído ao reparo com sucesso!',
      repair: rows[0]
    });
  } catch (error) {
    next(new AppError('Erro ao atribuir técnico ao reparo.', 500));
  }
};

// @desc    Obter uma ordem de reparo por ID
// @route   GET /api/repairs/:id
// @access  Private
exports.getRepairById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const repairQuery = `
      SELECT 
        r.*, 
        c.name as customer_name, 
        u.name as user_name, 
        t.name as technician_name
      FROM repairs r
      JOIN customers c ON r.customer_id = c.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN technicians t ON r.technician_id = t.id
      WHERE r.id = $1
    `;
    const { rows } = await pool.query(repairQuery, [id]);

    if (rows.length === 0) {
      return next(new AppError('Ordem de reparo não encontrada.', 404));
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    next(new AppError('Erro ao buscar ordem de reparo.', 500));
  }
};

// @desc    Criar uma nova ordem de reparo
// @route   POST /api/repairs
// @access  Private
exports.createRepair = async (req, res, next) => {
  const client = await pool.getClient();
  try {
    await client.query('BEGIN');

    const { customer_id, device_type, brand, model, imei_serial, problem_description, status, priority, service_cost, parts_cost, final_cost, tags, technician_id, start_date, expected_completion_date, warranty_period_days, warranty_start_date, warranty_end_date, quotation_signature_url, handover_signature_url } = req.body;
    const userId = req.user.id;
    const branchId = req.user.branch_id;

    const repairResult = await client.query(
      'INSERT INTO repairs (customer_id, user_id, device_type, brand, model, imei_serial, problem_description, status, priority, service_cost, parts_cost, final_cost, tags, technician_id, start_date, expected_completion_date, warranty_period_days, warranty_start_date, warranty_end_date, quotation_signature_url, handover_signature_url, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *;',
      [customer_id, userId, device_type, brand, model, imei_serial, problem_description, status, priority, service_cost, parts_cost, final_cost, tags, technician_id, start_date, expected_completion_date, warranty_period_days, warranty_start_date, warranty_end_date, quotation_signature_url, handover_signature_url, branchId]
    );
    const repair = repairResult.rows[0];

    // TODO: Log activity for repair creation

    await client.query('COMMIT');
    res.status(201).json({ message: 'Ordem de reparo criada com sucesso!', repair });
  } catch (error) {
    await client.query('ROLLBACK');
    next(new AppError('Erro ao criar ordem de reparo.', 500));
  } finally {
    client.release();
  }
};

// @desc    Atualizar uma ordem de reparo
// @route   PUT /api/repairs/:id
// @access  Private
exports.updateRepair = async (req, res, next) => {
  const client = await pool.getClient();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { customer_id, device_type, brand, model, imei_serial, problem_description, status, priority, service_cost, parts_cost, final_cost, tags, technician_id, start_date, expected_completion_date, actual_completion_date, warranty_period_days, warranty_start_date, warranty_end_date, quotation_signature_url, handover_signature_url } = req.body;

    const { rows } = await pool.query(
      'UPDATE repairs SET customer_id = $1, device_type = $2, brand = $3, model = $4, imei_serial = $5, problem_description = $6, status = $7, priority = $8, service_cost = $9, parts_cost = $10, final_cost = $11, tags = $12, technician_id = $13, start_date = $14, expected_completion_date = $15, actual_completion_date = $16, warranty_period_days = $17, warranty_start_date = $18, warranty_end_date = $19, quotation_signature_url = $20, handover_signature_url = $21, updated_at = NOW() WHERE id = $22 RETURNING *;',
      [customer_id, device_type, brand, model, imei_serial, problem_description, status, priority, service_cost, parts_cost, final_cost, tags, technician_id, start_date, expected_completion_date, actual_completion_date, warranty_period_days, warranty_start_date, warranty_end_date, quotation_signature_url, handover_signature_url, id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return next(new AppError('Ordem de reparo não encontrada para atualização.', 404));
    }

    // TODO: Log activity for repair update

    await client.query('COMMIT');
    res.status(200).json({ message: 'Ordem de reparo atualizada com sucesso!', repair: rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    next(new AppError('Erro ao atualizar ordem de reparo.', 500));
  }
};

// @desc    Deletar uma ordem de reparo
// @route   DELETE /api/repairs/:id
// @access  Private
exports.deleteRepair = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM repairs WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return next(new AppError('Ordem de reparo não encontrada para exclusão.', 404));
    }

    // TODO: Log activity for repair deletion

    res.status(204).send();
  } catch (error) {
    next(new AppError('Erro ao deletar ordem de reparo.', 500));
  }
};

// @desc    Obter métricas do Kanban
// @route   GET /api/repairs/kanban-metrics
// @access  Private
exports.getKanbanMetrics = async (req, res, next) => {
  try {
    // Placeholder: Implementar a lógica para obter métricas do Kanban aqui
    // Por enquanto, retorna um objeto vazio ou uma mensagem de sucesso
    res.status(200).json({ message: 'Métricas do Kanban (placeholder) - Implementar lógica aqui.', data: {} });
  } catch (error) {
    next(new AppError('Erro ao obter métricas do Kanban.', 500));
  }
};

// @desc    Obter configurações das colunas do Kanban
// @route   GET /api/repairs/kanban/settings
// @access  Private
exports.getKanbanSettings = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM kanban_column_settings ORDER BY column_order ASC;');
    res.status(200).json(rows);
  } catch (error) {
    next(new AppError('Erro ao buscar as configurações do Kanban.', 500));
  }
};


