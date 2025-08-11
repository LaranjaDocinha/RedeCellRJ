const db = require('../db');
const { logActivity } = require('../utils/activityLogger');
const { sendEmail } = require('../utils/emailService');
const { sendSms } = require('../utils/smsService'); // Placeholder for SMS service

// Obter todas as campanhas de marketing
exports.getAllMarketingCampaigns = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT mc.*, u.name as created_by_user_name FROM marketing_campaigns mc JOIN users u ON mc.created_by_user_id = u.id ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar campanhas de marketing:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter uma campanha de marketing por ID
exports.getMarketingCampaignById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT mc.*, u.name as created_by_user_name FROM marketing_campaigns mc JOIN users u ON mc.created_by_user_id = u.id WHERE mc.id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Campanha de marketing não encontrada.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Erro ao buscar campanha de marketing ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar uma nova campanha de marketing
exports.createMarketingCampaign = async (req, res) => {
  const { name, type, segmentation_criteria, message_template, scheduled_date_time } = req.body;
  const created_by_user_id = req.user.id;

  if (!name || !type || !message_template) {
    return res.status(400).json({ message: 'Nome, tipo e template da mensagem são obrigatórios.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO marketing_campaigns (name, type, segmentation_criteria, message_template, scheduled_date_time, created_by_user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [name, type, segmentation_criteria || null, message_template, scheduled_date_time || null, created_by_user_id]
    );
    const campaign = result.rows[0];

    await logActivity(req.user.name, `Campanha de marketing #${campaign.id} (${name}) criada.`, 'marketing_campaign', campaign.id);

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Erro ao criar campanha de marketing:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Atualizar uma campanha de marketing
exports.updateMarketingCampaign = async (req, res) => {
  const { id } = req.params;
  const { name, type, segmentation_criteria, message_template, scheduled_date_time, status } = req.body;

  try {
    const result = await db.query(
      'UPDATE marketing_campaigns SET name = $1, type = $2, segmentation_criteria = $3, message_template = $4, scheduled_date_time = $5, status = $6, updated_at = NOW() WHERE id = $7 RETURNING *;',
      [name, type, segmentation_criteria || null, message_template, scheduled_date_time || null, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Campanha de marketing não encontrada.' });
    }

    await logActivity(req.user.name, `Campanha de marketing #${id} (${name}) atualizada.`, 'marketing_campaign', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao atualizar campanha de marketing ${id}:`, error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Deletar uma campanha de marketing
exports.deleteMarketingCampaign = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM marketing_campaigns WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Campanha de marketing não encontrada.' });
    }

    await logActivity(req.user.name, `Campanha de marketing #${id} deletada.`, 'marketing_campaign', id);
    res.status(204).send();
  } catch (error) {
    console.error(`Erro ao deletar campanha de marketing ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Enviar uma campanha de marketing (manual trigger for now)
exports.sendMarketingCampaign = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT * FROM marketing_campaigns WHERE id = $1 FOR UPDATE;', [id]);
    if (rows.length === 0) {
      throw new Error('Campanha de marketing não encontrada.');
    }
    const campaign = rows[0];

    if (campaign.status === 'Sent') {
      throw new Error('Campanha já foi enviada.');
    }

    // Get customers based on segmentation criteria (simplified for now, fetch all)
    let customersQuery = 'SELECT id, name, email, phone FROM customers';
    const customersResult = await client.query(customersQuery);
    const customers = customersResult.rows;

    let sentCount = 0;
    for (const customer of customers) {
      let recipientStatus = 'Failed';
      let externalMessageId = null;

      try {
        if (campaign.type === 'Email' && customer.email) {
          await sendEmail(customer.email, campaign.name, campaign.message_template);
          recipientStatus = 'Sent'; // In a real scenario, this would be 'Delivered' or 'Opened' based on webhook
        } else if (campaign.type === 'SMS' && customer.phone) {
          await sendSms(customer.phone, campaign.message_template); // Placeholder call
          recipientStatus = 'Sent';
        }
        sentCount++;
      } catch (sendError) {
        console.error(`Erro ao enviar para ${customer.email || customer.phone}:`, sendError);
        recipientStatus = 'Failed';
      }

      // Log recipient status
      await client.query(
        'INSERT INTO campaign_recipients (campaign_id, customer_id, status, sent_at, external_message_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (campaign_id, customer_id) DO UPDATE SET status = EXCLUDED.status, sent_at = EXCLUDED.sent_at, external_message_id = EXCLUDED.external_message_id;',
        [campaign.id, customer.id, recipientStatus, new Date(), externalMessageId]
      );
    }

    // Update campaign status
    await client.query(
      'UPDATE marketing_campaigns SET status = $1, updated_at = NOW() WHERE id = $2;',
      [sentCount > 0 ? 'Sent' : 'Failed', campaign.id]
    );

    await logActivity(req.user.name, `Campanha de marketing #${id} (${campaign.name}) enviada para ${sentCount} clientes.`, 'marketing_campaign', id);

    await client.query('COMMIT');
    res.status(200).json({ message: `Campanha enviada com sucesso para ${sentCount} clientes.` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao enviar campanha de marketing:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Obter relatórios de campanha (ex: número de enviados, abertos, etc.)
exports.getCampaignReport = async (req, res) => {
  const { id } = req.params;
  try {
    const campaignResult = await db.query('SELECT id, name, type, status FROM marketing_campaigns WHERE id = $1', [id]);
    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ message: 'Campanha de marketing não encontrada.' });
    }
    const campaign = campaignResult.rows[0];

    const report = {
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      campaign_type: campaign.type,
      campaign_status: campaign.status,
      total_recipients: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      failed: 0,
    };

    const { rows } = await db.query('SELECT status, COUNT(*) as count FROM campaign_recipients WHERE campaign_id = $1 GROUP BY status;', [id]);

    rows.forEach(row => {
      report.total_recipients += parseInt(row.count, 10);
      if (row.status === 'Sent') report.sent = parseInt(row.count, 10);
      if (row.status === 'Delivered') report.delivered = parseInt(row.count, 10);
      if (row.status === 'Opened') report.opened = parseInt(row.count, 10);
      if (row.status === 'Clicked') report.clicked = parseInt(row.count, 10);
      if (row.status === 'Failed') report.failed = parseInt(row.count, 10);
    });

    res.json(report);
  } catch (error) {
    console.error(`Erro ao buscar relatório da campanha ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
