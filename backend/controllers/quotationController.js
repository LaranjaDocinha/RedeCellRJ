const db = require('../db');
const { logActivity } = require('../utils/activityLogger');
const { sendEmail } = require('../utils/emailService');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper function to generate PDF
const generateQuotationPdf = async (quotation, items) => {
  const doc = new PDFDocument();
  const filename = `quotation-${quotation.id}.pdf`;
  const filePath = path.join(__dirname, '..', '..', 'uploads', filename);

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(25).text('Orçamento', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Orçamento ID: ${quotation.id}`);
  doc.text(`Data: ${quotation.quotation_date.toLocaleDateString()}`);
  doc.text(`Válido até: ${quotation.valid_until_date ? quotation.valid_until_date.toLocaleDateString() : 'N/A'}`);
  doc.moveDown();

  doc.text(`Cliente: ${quotation.customer_name}`);
  doc.text(`Status: ${quotation.status}`);
  doc.moveDown();

  doc.fontSize(15).text('Itens:');
  doc.moveDown();

  items.forEach(item => {
    doc.text(`- ${item.description} (Qtd: ${item.quantity}, Preço Unit: R$${item.unit_price.toFixed(2)}) - Subtotal: R$${item.subtotal.toFixed(2)}`);
  });
  doc.moveDown();

  doc.fontSize(18).text(`Total: R$${quotation.total_amount.toFixed(2)}`, { align: 'right' });
  doc.moveDown();

  if (quotation.notes) {
    doc.fontSize(12).text('Observações:');
    doc.text(quotation.notes);
  }

  doc.end();

  return `/uploads/${filename}`;
};

// Obter todos os orçamentos
exports.getAllQuotations = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT q.*, c.name as customer_name, u.name as user_name FROM quotations q JOIN customers c ON q.customer_id = c.id JOIN users u ON q.user_id = u.id ORDER BY quotation_date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter um orçamento por ID
exports.getQuotationById = async (req, res) => {
  const { id } = req.params;
  try {
    const quotationResult = await db.query('SELECT q.*, c.name as customer_name, u.name as user_name FROM quotations q JOIN customers c ON q.customer_id = c.id JOIN users u ON q.user_id = u.id WHERE q.id = $1', [id]);
    if (quotationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Orçamento não encontrado.' });
    }
    const quotation = quotationResult.rows[0];

    const itemsResult = await db.query('SELECT * FROM quotation_items WHERE quotation_id = $1', [id]);
    quotation.items = itemsResult.rows;

    res.json(quotation);
  } catch (error) {
    console.error(`Erro ao buscar orçamento ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar um novo orçamento
exports.createQuotation = async (req, res) => {
  const { customer_id, valid_until_date, notes, items } = req.body;
  const user_id = req.user.id;

  if (!customer_id || !items || items.length === 0) {
    return res.status(400).json({ message: 'Dados do orçamento incompletos.' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    let total_amount = 0;
    for (const item of items) {
      item.subtotal = item.quantity * item.unit_price;
      total_amount += item.subtotal;
    }

    const quotationResult = await db.query(
      'INSERT INTO quotations (customer_id, user_id, valid_until_date, total_amount, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [customer_id, user_id, valid_until_date || null, total_amount, notes || null]
    );
    const quotation = quotationResult.rows[0];

    for (const item of items) {
      await client.query(
        'INSERT INTO quotation_items (quotation_id, product_id, product_variation_id, description, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5, $6, $7);',
        [quotation.id, item.product_id || null, item.product_variation_id || null, item.description, item.quantity, item.unit_price, item.subtotal]
      );
    }

    await logActivity(req.user.name, `Orçamento #${quotation.id} criado para o cliente ${customer_id}.`, 'quotation', quotation.id);

    await client.query('COMMIT');
    res.status(201).json(quotation);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Atualizar um orçamento
exports.updateQuotation = async (req, res) => {
  const { id } = req.params;
  const { customer_id, valid_until_date, notes, status, items } = req.body;

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    let total_amount = 0;
    if (items && items.length > 0) {
      for (const item of items) {
        item.subtotal = item.quantity * item.unit_price;
        total_amount += item.subtotal;
      }

      // Deletar itens antigos e inserir novos (simplificado para este exemplo)
      await client.query('DELETE FROM quotation_items WHERE quotation_id = $1;', [id]);
      for (const item of items) {
        await client.query(
          'INSERT INTO quotation_items (quotation_id, product_id, product_variation_id, description, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5, $6, $7);',
          [id, item.product_id || null, item.product_variation_id || null, item.description, item.quantity, item.unit_price, item.subtotal]
        );
      }
    }

    const result = await db.query(
      'UPDATE quotations SET customer_id = $1, valid_until_date = $2, total_amount = $3, notes = $4, status = $5, updated_at = NOW() WHERE id = $6 RETURNING *;',
      [customer_id, valid_until_date || null, total_amount, notes || null, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Orçamento não encontrado.' });
    }

    await logActivity(req.user.name, `Orçamento #${id} atualizado.`, 'quotation', id);

    await client.query('COMMIT');
    res.status(200).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Erro ao atualizar orçamento ${id}:`, error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Deletar um orçamento
exports.deleteQuotation = async (req, res) => {
  const { id } = req.params;
  try {
    // Itens do orçamento serão deletados em cascata devido ao ON DELETE CASCADE
    const { rowCount } = await db.query('DELETE FROM quotations WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Orçamento não encontrado.' });
    }

    await logActivity(req.user.name, `Orçamento #${id} deletado.`, 'quotation', id);
    res.status(204).send();
  } catch (error) {
    console.error(`Erro ao deletar orçamento ${id}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Gerar e enviar PDF do orçamento por e-mail
exports.sendQuotationPdf = async (req, res) => {
  const { id } = req.params;
  const { recipientEmail, subject, message } = req.body;

  if (!recipientEmail) {
    return res.status(400).json({ message: 'E-mail do destinatário é obrigatório.' });
  }

  try {
    const quotationResult = await db.query('SELECT q.*, c.name as customer_name FROM quotations q JOIN customers c ON q.customer_id = c.id WHERE q.id = $1', [id]);
    if (quotationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Orçamento não encontrado.' });
    }
    const quotation = quotationResult.rows[0];

    const itemsResult = await db.query('SELECT * FROM quotation_items WHERE quotation_id = $1', [id]);
    const items = itemsResult.rows;

    const pdfUrl = await generateQuotationPdf(quotation, items);

    // Update quotation with pdf_url
    await db.query('UPDATE quotations SET pdf_url = $1, status = \'Sent\', updated_at = NOW() WHERE id = $2;', [pdfUrl, id]);

    const emailSubject = subject || `Seu Orçamento #${quotation.id} da [Nome da Empresa]`;
    const emailMessage = message || `Prezado(a) ${quotation.customer_name},

Segue em anexo o seu orçamento #${quotation.id}.

Atenciosamente,
[Nome da Empresa]`;

    await sendEmail(recipientEmail, emailSubject, emailMessage, [{ path: path.join(__dirname, '..', '..', 'uploads', `quotation-${quotation.id}.pdf`), filename: `orcamento-${quotation.id}.pdf` }]);

    await logActivity(req.user.name, `Orçamento #${id} enviado para ${recipientEmail}.`, 'quotation', id);

    res.status(200).json({ message: 'Orçamento enviado com sucesso!', pdfUrl });
  } catch (error) {
    console.error(`Erro ao enviar orçamento ${id}:`, error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  }
};

// Atualizar status do orçamento (ex: Aprovado, Rejeitado)
exports.updateQuotationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status é obrigatório.' });
  }

  try {
    const result = await db.query(
      'UPDATE quotations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *;',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Orçamento não encontrado.' });
    }

    await logActivity(req.user.name, `Status do orçamento #${id} alterado para ${status}.`, 'quotation', id);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao atualizar status do orçamento ${id}:`, error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Converter orçamento para venda
exports.convertQuotationToSale = async (req, res) => {
  const { id } = req.params;
  const { payment_method, sale_date } = req.body;
  const user_id = req.user.id;

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const quotationResult = await client.query('SELECT * FROM quotations WHERE id = $1 FOR UPDATE;', [id]);
    if (quotationResult.rows.length === 0) {
      throw new Error('Orçamento não encontrado.');
    }
    const quotation = quotationResult.rows[0];

    if (quotation.status !== 'Approved') {
      throw new Error('Apenas orçamentos Aprovados podem ser convertidos em venda.');
    }

    const itemsResult = await client.query('SELECT * FROM quotation_items WHERE quotation_id = $1;', [id]);
    const quotationItems = itemsResult.rows;

    // Criar a venda
    const saleResult = await client.query(
      'INSERT INTO sales (customer_id, user_id, total_amount, payment_method, sale_date) VALUES ($1, $2, $3, $4, $5) RETURNING id;',
      [quotation.customer_id, user_id, quotation.total_amount, payment_method, sale_date || new Date()]
    );
    const saleId = saleResult.rows[0].id;

    // Inserir os itens da venda
    for (const item of quotationItems) {
      // Para simplificar, assumimos que product_id ou product_variation_id existem e são válidos
      // Em um cenário real, seria necessário verificar estoque, serialização, etc.
      await client.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4);',
        [saleId, item.product_variation_id || item.product_id, item.quantity, item.unit_price]
      );
    }

    // Atualizar status do orçamento para 'ConvertedToSale'
    await client.query('UPDATE quotations SET status = \'ConvertedToSale\', updated_at = NOW() WHERE id = $1;', [id]);

    await logActivity(req.user.name, `Orçamento #${id} convertido para venda #${saleId}.`, 'quotation', id);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Orçamento convertido para venda com sucesso!', saleId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Erro ao converter orçamento ${id} para venda:`, error);
    res.status(500).json({ message: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};