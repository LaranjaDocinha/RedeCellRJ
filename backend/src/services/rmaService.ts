import pool from '../db/index.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const rmaService = {
  async createRmaRequest(supplierId: number, items: any[], notes?: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const totalAmount = items.reduce((acc, item) => acc + item.cost_price * item.quantity, 0);

      const rmaRes = await client.query(
        'INSERT INTO rma_requests (supplier_id, total_amount, notes) VALUES ($1, $2, $3) RETURNING *',
        [supplierId, totalAmount, notes],
      );
      const rmaId = rmaRes.rows[0].id;

      for (const item of items) {
        await client.query(
          'INSERT INTO rma_items (rma_id, product_variation_id, quantity, reason, cost_price) VALUES ($1, $2, $3, $4, $5)',
          [rmaId, item.variation_id, item.quantity, item.reason, item.cost_price],
        );

        // Mover do estoque "bom" para um virtual "em devolução" ou apenas decrementar se não houver coluna de defeito
        // Por agora, apenas registramos a saída
        await client.query(
          'UPDATE branch_product_variations_stock SET stock_quantity = stock_quantity - $1 WHERE product_variation_id = $2',
          [item.quantity, item.variation_id],
        );
      }

      await client.query('COMMIT');
      return rmaRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async generateBorderou(rmaId: number) {
    const client = await pool.connect();
    try {
      const rmaRes = await client.query(
        `
            SELECT r.*, s.name as supplier_name 
            FROM rma_requests r 
            JOIN suppliers s ON r.supplier_id = s.id 
            WHERE r.id = $1
        `,
        [rmaId],
      );
      const rma = rmaRes.rows[0];

      const itemsRes = await client.query(
        `
            SELECT ri.*, pv.sku, p.name as product_name 
            FROM rma_items ri 
            JOIN product_variations pv ON ri.product_variation_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE ri.rma_id = $1
        `,
        [rmaId],
      );

      const doc = new jsPDF() as any;
      doc.setFontSize(18);
      doc.text('BORDERÔ DE DEVOLUÇÃO (RMA)', 105, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`ID RMA: #${rma.id}`, 15, 35);
      doc.text(`Fornecedor: ${rma.supplier_name}`, 15, 40);
      doc.text(`Data: ${new Date(rma.created_at).toLocaleDateString()}`, 15, 45);

      doc.autoTable({
        startY: 55,
        head: [['SKU', 'Produto', 'Qtd', 'Motivo', 'Custo Un.']],
        body: itemsRes.rows.map((i) => [
          i.sku,
          i.product_name,
          i.quantity,
          i.reason,
          `R$ ${i.cost_price}`,
        ]),
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] },
      });

      doc.text(
        `Valor Total do Crédito Pleiteado: R$ ${rma.total_amount}`,
        15,
        (doc as any).lastAutoTable.cursor.y + 15,
      );

      return doc.output('arraybuffer');
    } finally {
      client.release();
    }
  },
};
