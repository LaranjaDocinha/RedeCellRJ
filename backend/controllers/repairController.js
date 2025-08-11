const db = require('../db');
const { logActivity } = require('../utils/activityLogger');
const { sendEmail } = require('../utils/emailService');
const { format, isPast, isToday, addDays } = require('date-fns');
const multer = require('multer');
const path = require('path');
const { AppError, NotFoundError, BadRequestError } = require('../utils/appError');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Helper function to determine deadline status
const getDeadlineStatus = (expectedCompletionDate, actualCompletionDate, status) => {
  if (status === 'Finalizado' && actualCompletionDate) {
    const expected = new Date(expectedCompletionDate);
    const actual = new Date(actualCompletionDate);
    return actual <= expected ? 'Concluído no Prazo' : 'Concluído com Atraso';
  }

  if (status === 'Cancelado') {
    return 'Cancelado';
  }

  if (!expectedCompletionDate) {
    return 'Sem Prazo Definido';
  }

  const today = new Date();
  const expected = new Date(expectedCompletionDate);

  if (isPast(expected) && !isToday(expected)) {
    return 'Atrasado';
  }

  const daysUntilDue = Math.ceil((expected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue <= 3) {
    return 'Próximo do Vencimento';
  }

  return 'No Prazo';
};


// Obter todas as ordens de reparo
exports.getAllRepairs = async (req, res) => {
  const { groupBy } = req.query;

  if (groupBy) {
    return exports.getRepairsForKanban(req, res);
  }

  try {
    const { rows } = await db.query('SELECT * FROM repairs ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar todas as ordens de reparo:', error);
    throw new AppError('Erro interno do servidor', 500);
  }
};

// Obter uma ordem de reparo por ID
exports.getRepairById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM repairs WHERE id = $1', [id]);
    if (rows.length === 0) {
      throw new NotFoundError('Ordem de reparo não encontrada.');
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Erro ao buscar ordem de reparo ${id}:`, error);
    throw new AppError('Erro interno do servidor', 500);
  }
};

// Criar uma nova ordem de reparo
exports.createRepair = async (req, res) => {
  const { customer_id, device_type, model, problem_description, status, technician_id, priority, expected_completion_date, serial_number, accessories, condition_on_receipt, repair_actions, parts_cost, labor_cost, discount, final_cost, payment_status, notes, warranty_period_days } = req.body;
  const user_id = req.user.id;

  try {
    const result = await db.query(
      'INSERT INTO repairs (customer_id, user_id, device_type, model, problem_description, status, technician_id, priority, expected_completion_date, serial_number, accessories, condition_on_receipt, repair_actions, parts_cost, labor_cost, discount, final_cost, payment_status, notes, warranty_period_days) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *;',
      [customer_id, user_id, device_type, model, problem_description, status, technician_id, priority, expected_completion_date, serial_number, accessories, condition_on_receipt, repair_actions, parts_cost, labor_cost, discount, final_cost, payment_status, notes, warranty_period_days || 0]
    );
    await logActivity(req.user.name, `Nova ordem de reparo #${result.rows[0].id} criada.`, 'repair', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar ordem de reparo:', error);
    throw new AppError('Erro interno do servidor', 500);
  }
};

// Atualizar uma ordem de reparo
exports.updateRepair = async (req, res) => {
  const { id } = req.params;
  const { customer_id, device_type, model, problem_description, status, technician_id, priority, expected_completion_date, serial_number, accessories, condition_on_receipt, repair_actions, parts_cost, labor_cost, discount, final_cost, payment_status, notes, warranty_period_days, quotation_signature_url } = req.body;
  const user_id = req.user.id;

  try {
    const result = await db.query(
      'UPDATE repairs SET customer_id = $1, device_type = $2, model = $3, problem_description = $4, status = $5, technician_id = $6, priority = $7, expected_completion_date = $8, serial_number = $9, accessories = $10, condition_on_receipt = $11, repair_actions = $12, parts_cost = $13, labor_cost = $14, discount = $15, final_cost = $16, payment_status = $17, notes = $18, warranty_period_days = $19, quotation_signature_url = $20, updated_at = NOW() WHERE id = $21 RETURNING *;',
      [customer_id, device_type, model, problem_description, status, technician_id, priority, expected_completion_date, serial_number, accessories, condition_on_receipt, repair_actions, parts_cost, labor_cost, discount, final_cost, payment_status, notes, warranty_period_days, quotation_signature_url, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Ordem de reparo não encontrada.');
    }

    await logActivity(req.user.name, `Ordem de reparo #${id} atualizada.`, 'repair', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao atualizar ordem de reparo ${id}:`, error);
    throw new AppError('Erro interno do servidor', 500);
  }
};

// Deletar uma ordem de reparo
exports.deleteRepair = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM repairs WHERE id = $1', [id]);

    if (rowCount === 0) {
      throw new NotFoundError('Ordem de reparo não encontrada.');
    }

    await logActivity(req.user.name, `Ordem de reparo #${id} deletada.`, 'repair', id);
    res.status(204).send();
  } catch (error) {
    console.error(`Erro ao deletar ordem de reparo ${id}:`, error);
    throw new AppError('Erro interno do servidor', 500);
  }
};

// Função para buscar e agrupar os reparos para o quadro Kanban
exports.getRepairsForKanban = async (req, res) => {
  const { groupBy } = req.query; // 'technician' or 'priority'
  try {
    const settingsResult = await db.query('SELECT column_name FROM kanban_column_settings ORDER BY column_order ASC');
    const orderedColumns = settingsResult.rows.map(row => row.column_name);

    let repairsQuery = `
      SELECT 
        r.id, r.status, r.device_type, r.model, r.problem_description,
        r.final_cost, r.created_at, c.name as customer_name,
        t.name as technician_name, r.priority, r.technician_id
      FROM repairs r
      JOIN customers c ON r.customer_id = c.id
      LEFT JOIN technicians t ON r.technician_id = t.id
      WHERE r.status != 'Entregue' AND r.status != 'Cancelado'
      ORDER BY r.created_at DESC;
    `;
    const repairsResult = await db.query(repairsQuery);
    const repairs = repairsResult.rows;

    const kanbanData = { lanes: {}, tasks: {} };

    // Populate tasks object
    repairs.forEach(repair => {
      kanbanData.tasks[repair.id.toString()] = { ...repair, id: repair.id.toString() };
    });

    // Initialize lanes based on groupBy, even if no repairs
    if (groupBy === 'technician') {
      const technicians = await db.query('SELECT id, name FROM technicians ORDER BY name');
      const technicianLanes = technicians.rows.map(tech => ({
        id: `technician-${tech.id}`,
        title: tech.name,
        columns: JSON.parse(JSON.stringify(orderedColumns.reduce((acc, col) => ({ ...acc, [col]: { id: col, title: col, taskIds: [] } }), {}))),
        columnOrder: orderedColumns,
      }));
      technicianLanes.push({
        id: 'technician-unassigned',
        title: 'Não Atribuído',
        columns: JSON.parse(JSON.stringify(orderedColumns.reduce((acc, col) => ({ ...acc, [col]: { id: col, title: col, taskIds: [] } }), {}))),
        columnOrder: orderedColumns,
      });
      technicianLanes.forEach(lane => {
        kanbanData.lanes[lane.id] = lane;
      });
    } else if (groupBy === 'priority') {
      const priorities = ['Urgente', 'Alta', 'Normal', 'Baixa'];
      const priorityLanes = priorities.map(p => ({
        id: `priority-${p}`,
        title: p,
        columns: JSON.parse(JSON.stringify(orderedColumns.reduce((acc, col) => ({ ...acc, [col]: { id: col, title: col, taskIds: [] } }), {}))),
        columnOrder: orderedColumns,
      }));
      priorityLanes.forEach(lane => {
        kanbanData.lanes[lane.id] = lane;
      });
    } else { // No grouping (default)
      const allLane = {
        id: 'all',
        title: 'Todos os Reparos',
        columns: JSON.parse(JSON.stringify(orderedColumns.reduce((acc, col) => ({ ...acc, [col]: { id: col, title: col, taskIds: [] } }), {}))),
        columnOrder: orderedColumns,
      };
      kanbanData.lanes.all = allLane;
    }

    // Assign repairs to lanes/columns after lanes are initialized
    repairs.forEach(repair => {
      let laneId;
      if (groupBy === 'technician') {
        laneId = repair.technician_id ? `technician-${repair.technician_id}` : 'technician-unassigned';
      } else if (groupBy === 'priority') {
        laneId = `priority-${repair.priority}`;
      } else {
        laneId = 'all';
      }

      if (kanbanData.lanes[laneId] && kanbanData.lanes[laneId].columns[repair.status]) {
        kanbanData.lanes[laneId].columns[repair.status].taskIds.push(repair.id.toString());
      }
    });

    res.json(kanbanData);

  } catch (error) {
    console.error('Erro ao buscar reparos para o Kanban:', error);
    throw new AppError('Erro interno do servidor', 500);
  }
};

// --- Funções para Configuração do Kanban ---

// @desc    Obter configurações do Kanban (cores, ordem)
// @route   GET /api/repairs/kanban/settings
// @access  Private
exports.getKanbanSettings = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM kanban_column_settings ORDER BY column_order ASC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar configurações do Kanban:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// @desc    Atualizar configurações do Kanban
// @route   POST /api/repairs/kanban/settings
// @access  Admin
exports.updateKanbanSettings = async (req, res) => {
  const newSettings = req.body; // Espera um array de objetos de configuração com IDs

  if (!Array.isArray(newSettings)) {
    throw new BadRequestError('Dados de configuração inválidos. Esperado um array.');
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // 1. Obter as configurações atuais do banco de dados
    const { rows: currentSettings } = await client.query('SELECT id, column_name FROM kanban_column_settings');
    const currentSettingIds = new Set(currentSettings.map(s => s.id));
    const incomingSettingIds = new Set(newSettings.filter(s => s.id).map(s => s.id));

    // 2. Identificar e deletar colunas removidas
    const idsToDelete = [...currentSettingIds].filter(id => !incomingSettingIds.has(id));
    if (idsToDelete.length > 0) {
      await client.query('DELETE FROM kanban_column_settings WHERE id = ANY($1)', [idsToDelete]);
    }

    // 3. Inserir ou atualizar colunas
    for (const setting of newSettings) {
      const { id, column_name, background_color, text_color, column_order } = setting;

      if (id) { // Coluna existente, fazer UPDATE
        const query = `
          UPDATE kanban_column_settings
          SET column_name = $1, background_color = $2, text_color = $3, column_order = $4
          WHERE id = $5;
        `;
        await client.query(query, [column_name, background_color, text_color, column_order, id]);
      } else { // Nova coluna, fazer INSERT
        const query = `
          INSERT INTO kanban_column_settings (column_name, background_color, text_color, column_order)
          VALUES ($1, $2, $3, $4);
        `;
        await client.query(query, [column_name, background_color, text_color, column_order]);
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Configurações do Kanban atualizadas com sucesso.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar configurações do Kanban:', error);
    throw new AppError('Erro interno do servidor', 500);
  } finally {
    client.release();
  }
};

// @desc    Obter detalhes da garantia de um reparo
// @route   GET /api/repairs/:id/warranty
// @access  Private
exports.getRepairWarrantyDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT warranty_period_days, warranty_start_date, warranty_end_date, warranty_status FROM repairs WHERE id = $1',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Detalhes da garantia não encontrados para este reparo.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Erro ao buscar detalhes da garantia para o reparo ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// @desc    Upload de assinatura digital
// @route   POST /api/repairs/upload-signature
// @access  Private
exports.uploadSignature = [upload.single('signature'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo de assinatura enviado.' });
  }
  // Construct the URL for the saved signature
  const signatureUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ message: 'Assinatura enviada com sucesso!', url: signatureUrl });
}];

// @desc    Obter histórico completo do aparelho por número de série/IMEI
// @route   GET /api/repairs/device-history/:serialNumber
// @access  Private
exports.getDeviceHistoryBySerial = async (req, res) => {
  const { serialNumber } = req.params;
  try {
    const history = {};

    // 1. Get product serial details
    const serialDetailsResult = await db.query(
      'SELECT ps.*, pv.barcode, p.name as product_name, pv.color, pv.size FROM product_serials ps JOIN product_variations pv ON ps.product_variation_id = pv.id JOIN products p ON pv.product_id = p.id WHERE ps.serial_number = $1;',
      [serialNumber]
    );
    if (serialDetailsResult.rows.length === 0) {
      return res.status(404).json({ message: 'Número de série/IMEI não encontrado.' });
    }
    history.serial_details = serialDetailsResult.rows[0];

    // 2. Get repair history for this serial
    const repairsResult = await db.query(
      'SELECT r.*, c.name as customer_name, t.name as technician_name FROM repairs r LEFT JOIN customers c ON r.customer_id = c.id LEFT JOIN technicians t ON r.technician_id = t.id WHERE r.serial_number = $1 ORDER BY r.created_at DESC;',
      [serialNumber]
    );
    history.repairs = repairsResult.rows;

    // 3. Get sales history for this serial
    const salesResult = await db.query(
      'SELECT si.*, s.sale_date, s.total_amount, c.name as customer_name FROM sale_items si JOIN sales s ON si.sale_id = s.id JOIN customers c ON s.customer_id = c.id WHERE si.serial_number = $1 ORDER BY s.sale_date DESC;',
      [serialNumber]
    );
    history.sales = salesResult.rows;

    // 4. Get stock history for the associated product variation (if found)
    if (history.serial_details && history.serial_details.product_variation_id) {
      const stockHistoryResult = await db.query(
        'SELECT sh.*, u.name as user_name FROM stock_history sh LEFT JOIN users u ON sh.user_id = u.id WHERE sh.variation_id = $1 ORDER BY sh.timestamp DESC;',
        [history.serial_details.product_variation_id]
      );
      history.stock_movements = stockHistoryResult.rows;
    }

    res.json(history);
  } catch (error) {
    console.error(`Erro ao buscar histórico do aparelho ${serialNumber}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const consumeReservedParts = async (client, repairId, userId) => {
  const { rows: parts } = await client.query('SELECT * FROM repair_parts WHERE repair_id = $1', [repairId]);
  for (const part of parts) {
    await client.query(
      'UPDATE product_variations SET stock_quantity = stock_quantity - $1, reserved_quantity = reserved_quantity - $1 WHERE id = $2',
      [part.quantity_used, part.variation_id]
    );
    await client.query(
        'INSERT INTO stock_history (variation_id, user_id, change_type, quantity_change, reason) VALUES ($1, $2, $3, $4, $5)',
        [part.variation_id, userId, 'consumo_reparo', -part.quantity_used, `Consumo na O.S. ID: ${repairId}`]
    );
  }
};

const releaseReservedParts = async (client, repairId, userId) => {
  const { rows: parts } = await client.query('SELECT * FROM repair_parts WHERE repair_id = $1', [repairId]);
  for (const part of parts) {
    await client.query(
      'UPDATE product_variations SET reserved_quantity = reserved_quantity - $1 WHERE id = $2',
      [part.quantity_used, part.variation_id]
    );
     await logActivity(userId, `Reserva da peça #${part.variation_id} liberada devido ao cancelamento do reparo #${repairId}.`, 'repair', repairId);
  }
};

// Função para atualizar o status de um reparo (será usada pelo Drag-and-Drop)
exports.updateRepairStatus = async (req, res) => {
  const { repairId } = req.params;
  const { newStatus, oldStatus, technicianId, priority, handover_signature_url } = req.body; // Adicionado technicianId, priority e handover_signature_url
  const userId = req.user.id; // Assumindo que o ID do usuário vem do token de autenticação

  if (!newStatus) {
    throw new BadRequestError('Novo status é obrigatório.');
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const oldRepairResult = await client.query('SELECT status, customer_id, user_id, technician_id, priority, warranty_period_days FROM repairs WHERE id = $1', [repairId]); // Fetch customer_id, user_id (creator), and warranty_period_days
    if (oldRepairResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new NotFoundError('O.S. não encontrada.');
    }
    const oldRepair = oldRepairResult.rows[0];
    const status_from = oldRepair.status;
    const warrantyPeriodDays = oldRepair.warranty_period_days || 0; // Default to 0 if not set

    // Lógica de consumo/liberação de estoque
    if ((newStatus === 'Finalizado' || newStatus === 'Entregue') && status_from !== 'Finalizado' && status_from !== 'Entregue') {
        await consumeReservedParts(client, repairId, req.user.name);
        // Set warranty dates if applicable
        if (warrantyPeriodDays > 0) {
            const warrantyStartDate = new Date();
            const warrantyEndDate = addDays(warrantyStartDate, warrantyPeriodDays);
            updateQuery += `, warranty_start_date = ${paramIndex++}, warranty_end_date = ${paramIndex++}, warranty_status = ${paramIndex++}`;
            queryParams.push(warrantyStartDate, warrantyEndDate, 'Active');
        }
    } else if (newStatus === 'Cancelado' && status_from !== 'Cancelado') {
        await releaseReservedParts(client, repairId, req.user.name);
        // If cancelled, set warranty status to N/A
        updateQuery += `, warranty_status = ${paramIndex++}`;
        queryParams.push('N/A');
    }

    let updateQuery = 'UPDATE repairs SET status = $1, updated_at = NOW()';
    const queryParams = [newStatus];
    let paramIndex = 2;

    if (technicianId !== undefined && technicianId !== oldRepair.technician_id) {
      updateQuery += `, technician_id = ${paramIndex++}`;
      queryParams.push(technicianId);
    }
    if (priority !== undefined && priority !== oldRepair.priority) {
      updateQuery += `, priority = ${paramIndex++}`;
      queryParams.push(priority);
    }

    if (newStatus === 'Entregue' && handover_signature_url) {
        updateQuery += `, handover_signature_url = ${paramIndex++}`;
        queryParams.push(handover_signature_url);
    }

    updateQuery += ` WHERE id = ${paramIndex}`;
    queryParams.push(repairId);

    await client.query(updateQuery, queryParams);

    await logActivity(req.user.name, `Status do reparo #${repairId} alterado de ${status_from} para ${newStatus}.`, 'repair', repairId);
    
    await client.query('COMMIT');
    res.status(200).json({ message: 'Status e/ou atribuição atualizados com sucesso.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Erro ao atualizar status do reparo ${repairId}:`, error);
    throw new AppError('Erro interno do servidor', 500);
  } finally {
    client.release();
  }
};

exports.addPartToRepair = async (req, res) => {
    const { id: repair_id } = req.params;
    const { variation_id, quantity_used } = req.body;
    if (!variation_id || !quantity_used || quantity_used <= 0) {
        throw new BadRequestError('ID da peça e quantidade válida são obrigatórios.');
    }

    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const user_id = req.user.id;

        const variationResult = await client.query(
            'SELECT price, stock_quantity, reserved_quantity FROM product_variations WHERE id = $1 FOR UPDATE',
            [variation_id]
        );
        if (variationResult.rows.length === 0) throw new NotFoundError('Peça não encontrada no estoque.');
        
        const variation = variationResult.rows[0];
        const available_stock = variation.stock_quantity - variation.reserved_quantity;

        if (available_stock < quantity_used) {
            throw new BadRequestError(`Estoque insuficiente. Apenas ${available_stock} unidades disponíveis para reserva.`);
        }

        // Aumenta a quantidade reservada em vez de diminuir o estoque principal
        await client.query(
            'UPDATE product_variations SET reserved_quantity = reserved_quantity + $1 WHERE id = $2',
            [quantity_used, variation_id]
        );

        const unit_price_at_time = parseFloat(variation.price);
        await client.query(
            'INSERT INTO repair_parts (repair_id, variation_id, quantity_used, unit_price_at_time) VALUES ($1, $2, $3, $4)',
            [repair_id, variation_id, quantity_used, unit_price_at_time]
        );

        const cost_increase = unit_price_at_time * quantity_used;
        await client.query(
            'UPDATE repairs SET parts_cost = parts_cost + $1, final_cost = final_cost + $1, updated_at = NOW() WHERE id = $2',
            [cost_increase, repair_id]
        );
        
        await logActivity(req.user.name, `${quantity_used} unidade(s) da peça #${variation_id} reservada(s) para o reparo #${repair_id}.`, 'repair', repair_id);

        await client.query('COMMIT');
        res.status(201).json({ message: 'Peça reservada com sucesso.' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao adicionar/reservar peça ao reparo:', err);
        throw new AppError(err.message || 'Erro interno do servidor.', 500);
    } finally {
        client.release();
    }
};

exports.removePartFromRepair = async (req, res) => {
    const { repairId, partId } = req.params;
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const partResult = await client.query('SELECT * FROM repair_parts WHERE id = $1 AND repair_id = $2', [partId, repairId]);
        if (partResult.rows.length === 0) {
            throw new NotFoundError('Peça não encontrada neste reparo.');
        }
        const part = partResult.rows[0];

        // Libera a quantidade que estava reservada
        await client.query(
            'UPDATE product_variations SET reserved_quantity = reserved_quantity - $1 WHERE id = $2',
            [part.quantity_used, part.variation_id]
        );

        // Remove o registro da peça do reparo
        await client.query('DELETE FROM repair_parts WHERE id = $1', [partId]);

        // Atualiza os custos do reparo
        const cost_decrease = part.unit_price_at_time * part.quantity_used;
        await client.query(
            'UPDATE repairs SET parts_cost = parts_cost - $1, final_cost = final_cost - $1, updated_at = NOW() WHERE id = $2',
            [cost_decrease, repairId]
        );

        await logActivity(req.user.name, `Reserva da peça #${part.variation_id} removida do reparo #${repairId}.`, 'repair', repairId);

        await client.query('COMMIT');
        res.status(200).json({ message: 'Peça removida e reserva liberada com sucesso.' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao remover peça do reparo:', err);
        throw new AppError(err.message || 'Erro interno do servidor.', 500);
    } finally {
        client.release();
    }
};

exports.getRepairActivity = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM activity_log WHERE entity_type = $1 AND entity_id = $2 ORDER BY timestamp DESC',
      ['repair', id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(`Erro ao buscar atividades para o reparo ${id}:`, error);
    throw new AppError('Erro interno do servidor', 500);
  }
};

exports.addCommentToRepair = async (req, res) => {
  const { id: repair_id } = req.params;
  const { comment_text } = req.body;
  const user_id = req.user.id;

  if (!comment_text) {
    throw new BadRequestError('O texto do comentário é obrigatório.');
  }

  try {
    const result = await db.query(
      'INSERT INTO comments (repair_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *;',
      [repair_id, user_id, comment_text]
    );
    // Log de atividade para o comentário
    await logActivity(req.user.name, `Comentário adicionado ao reparo #${repair_id}.`, 'repair', repair_id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao adicionar comentário ao reparo ${repair_id}:`, error);
    throw new AppError('Erro interno do servidor', 500);
  }
};

exports.getCommentsForRepair = async (req, res) => {
  const { id: repair_id } = req.params;
  try {
    const result = await db.query(
      'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON c.user_id = u.id WHERE repair_id = $1 ORDER BY created_at DESC;',
      [repair_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(`Erro ao buscar comentários para o reparo ${repair_id}:`, error);
    throw new AppError('Erro interno do servidor', 500);
  }
};

exports.getCycleTimeMetrics = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        r.id AS repair_id,
        r.created_at AS start_date,
        MAX(CASE WHEN rh.status_to = 'Finalizado' THEN rh.created_at ELSE NULL END) AS end_date
      FROM repairs r
      JOIN repair_history rh ON r.id = rh.repair_id
      WHERE r.status = 'Finalizado'
      GROUP BY r.id, r.created_at
      HAVING MAX(CASE WHEN rh.status_to = 'Finalizado' THEN rh.created_at ELSE NULL END) IS NOT NULL
      ORDER BY r.created_at DESC;
    `);

    const cycleTimes = result.rows.map(row => {
      const startDate = new Date(row.start_date);
      const endDate = new Date(row.end_date);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { repair_id: row.repair_id, cycle_time_days: diffDays, end_date: row.end_date };
    });

    res.json(cycleTimes);
  } catch (error) {
    console.error('Erro ao buscar métricas de Cycle Time:', error);
    throw new AppError('Erro interno do servidor', 500);
  }
};

exports.getCFDMetrics = async (req, res) => {
  try {
    // Obter todos os status de reparo distintos
    const statusResult = await db.query('SELECT DISTINCT status FROM repairs ORDER BY status;');
    const allStatuses = statusResult.rows.map(row => row.status);

    // Obter todas as datas distintas de criação/atualização de reparos e histórico
    const datesResult = await db.query(`
      SELECT DISTINCT date_trunc('day', created_at) as date FROM repairs
      UNION
      SELECT DISTINCT date_trunc('day', created_at) as date FROM repair_history
      ORDER BY date;
    `);
    const allDates = datesResult.rows.map(row => row.date);

    const cfdData = [];

    for (const date of allDates) {
      const dateString = format(new Date(date), 'yyyy-MM-dd');
      const row = { date: dateString };

      for (const status of allStatuses) {
        // Contar o número de reparos que entraram ou estavam em um status até a data atual
        const countResult = await db.query(`
          SELECT COUNT(DISTINCT r.id)
          FROM repairs r
          WHERE r.created_at <= $1
            AND (
              r.status = $2 AND r.created_at <= $1 -- Reparos que começaram e estão neste status
              OR EXISTS (
                SELECT 1 FROM repair_history rh
                WHERE rh.repair_id = r.id
                  AND rh.status_to = $2
                  AND rh.created_at <= $1
                  AND NOT EXISTS (
                    SELECT 1 FROM repair_history rh_later
                    WHERE rh_later.repair_id = r.id
                      AND rh_later.created_at > rh.created_at
                      AND rh_later.created_at <= $1
                  )
              )
            );
        `, [date, status]);
        row[status] = parseInt(countResult.rows[0].count, 10);
      }
      cfdData.push(row);
    }

    res.json({ cfdData, allStatuses });
  } catch (error) {
    console.error('Erro ao buscar métricas de CFD:', error);
    throw new AppError('Erro interno do servidor', 500);
  }
};

// --- Funções para o novo sistema de Checklist baseado em Templates ---

// @desc    Associa um template de checklist a um reparo (como pré ou pós-reparo)
// @route   POST /api/repairs/:id/checklists
// @access  Private
exports.assignChecklistToRepair = async (req, res) => {
  const { id: repair_id } = req.params;
  const { template_id, type } = req.body; // type: 'pre-repair' or 'post-repair'

  if (!template_id || !type) {
    throw new BadRequestError('template_id e type são obrigatórios.');
  }

  try {
    const query = 'INSERT INTO repair_checklist_instances (repair_id, template_id, type) VALUES ($1, $2, $3) RETURNING *';
    const { rows } = await db.query(query, [repair_id, template_id, type]);
    
    await logActivity(req.user.name, `Checklist (template #${template_id}) associado ao reparo #${repair_id}.`, 'repair', repair_id);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao associar checklist ao reparo:', err);
    if (err.code === '23505') { // unique_violation
        throw new BadRequestError(`Um checklist do tipo '${type}' já existe para este reparo.`);
    }
    throw new AppError('Erro interno do servidor.', 500);
  }
};

// @desc    Obtém todos os checklists de um reparo, com itens e respostas
// @route   GET /api/repairs/:id/checklists
// @access  Private
exports.getChecklistsForRepair = async (req, res) => {
  const { id: repair_id } = req.params;
  try {
    const instancesQuery = 'SELECT * FROM repair_checklist_instances WHERE repair_id = $1';
    const instancesResult = await db.query(instancesQuery, [repair_id]);

    if (instancesResult.rows.length === 0) {
      return res.json([]);
    }

    const instances = instancesResult.rows;
    const response = [];

    for (const instance of instances) {
      const itemsQuery = 'SELECT * FROM checklist_template_items WHERE template_id = $1 ORDER BY display_order';
      const itemsResult = await db.query(itemsQuery, [instance.template_id]);
      const items = itemsResult.rows;

      const answersQuery = 'SELECT * FROM repair_checklist_answers WHERE instance_id = $1';
      const answersResult = await db.query(answersQuery, [instance.id]);
      const answersMap = new Map(answersResult.rows.map(a => [a.template_item_id, a]));

      const populatedItems = items.map(item => ({
        ...item,
        answer: answersMap.get(item.id) || null
      }));

      response.push({
        ...instance,
        items: populatedItems
      });
    }

    res.json(response);

  } catch (err) {
    console.error('Erro ao buscar checklists do reparo:', err);
    throw new AppError('Erro interno do servidor.', 500);
  }
};

// @desc    Salva as respostas de um checklist de reparo
// @route   PUT /api/repairs/:id/checklists/:instanceId
// @access  Private
exports.saveChecklistAnswers = async (req, res) => {
  const { instanceId } = req.params;
  const { answers } = req.body; // Espera um array de { template_item_id, answer_boolean, answer_text }
  const user_id = req.user.id;

  if (!Array.isArray(answers)) {
    throw new BadRequestError('O formato das respostas é inválido.');
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Usar ON CONFLICT para fazer um "upsert": atualiza se a resposta já existir, insere se for nova.
    const upsertQuery = `
      INSERT INTO repair_checklist_answers (instance_id, template_item_id, answer_boolean, answer_text)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (instance_id, template_item_id) DO UPDATE SET
        answer_boolean = EXCLUDED.answer_boolean,
        answer_text = EXCLUDED.answer_text,
        updated_at = NOW();
    `;

    for (const answer of answers) {
      await client.query(upsertQuery, [
        instanceId,
        answer.template_item_id,
        answer.answer_boolean,
        answer.answer_text
      ]);
    }

    // Atualiza o status da instância do checklist para 'completed'
    await client.query(
      'UPDATE repair_checklist_instances SET status = $1, completed_by_user_id = $2, completed_at = NOW() WHERE id = $3',
      ['completed', user_id, instanceId]
    );

    const repairIdResult = await client.query('SELECT repair_id FROM repair_checklist_instances WHERE id = $1', [instanceId]);
    const repair_id = repairIdResult.rows[0]?.repair_id;

    if(repair_id) {
        await logActivity(req.user.name, `Checklist #${instanceId} do reparo #${repair_id} foi preenchido.`, 'repair', repair_id);
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Respostas do checklist salvas com sucesso.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao salvar respostas do checklist:', err);
    throw new AppError('Erro interno do servidor.', 500);
  } finally {
    client.release();
  }
};

// Funções para Time Tracking
exports.addTimeEntry = async (req, res) => {
  const { id: repair_id } = req.params;
  const { start_time, end_time, notes } = req.body;
  const user_id = req.user.id;

  if (!start_time || !end_time) {
    throw new BadRequestError('Horário de início e fim são obrigatórios.');
  }

  try {
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    const duration_minutes = Math.round((endDate - startDate) / (1000 * 60));

    const { rows } = await db.query(
      'INSERT INTO repair_time_entries (repair_id, user_id, start_time, end_time, duration_minutes, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [repair_id, user_id, startDate, endDate, duration_minutes, notes]
    );

    await logActivity(req.user.name, `Entrada de tempo de ${duration_minutes} minutos adicionada ao reparo #${repair_id}.`, 'repair', repair_id);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao adicionar entrada de tempo:', err);
    throw new AppError('Erro interno do servidor.', 500);
  }
};

exports.getTimeEntries = async (req, res) => {
  const { id: repair_id } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT rte.*, u.name as user_name FROM repair_time_entries rte JOIN users u ON rte.user_id = u.id WHERE repair_id = $1 ORDER BY start_time DESC;',
      [repair_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar entradas de tempo:', err);
    throw new AppError('Erro interno do servidor.', 500);
  }
};

exports.deleteTimeEntry = async (req, res) => {
  const { repairId, entryId } = req.params;
  try {
    const { rowCount } = await db.query(
      'DELETE FROM repair_time_entries WHERE id = $1 AND repair_id = $2;',
      [entryId, repairId]
    );

    if (rowCount === 0) {
      throw new NotFoundError('Entrada de tempo não encontrada.');
    }

    await logActivity(req.user.name, `Entrada de tempo #${entryId} removida do reparo #${repairId}.`, 'repair', repairId);

    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar entrada de tempo:', err);
    throw new AppError('Erro interno do servidor.', 500);
  }
};

// @desc    Obter configurações do Kanban (cores, ordem)
// @route   GET /api/repairs/kanban/settings
// @access  Private
exports.getKanbanSettings = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM kanban_column_settings ORDER BY column_order ASC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar configurações do Kanban:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
