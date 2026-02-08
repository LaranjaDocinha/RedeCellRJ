import { getPool } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import nodemailer from 'nodemailer';

class ReceiptService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'user@example.com',
        pass: process.env.EMAIL_PASS || 'password',
      },
    });
  }

  async generateReceipt(saleId: string): Promise<string> {
    const pool = getPool();
    const saleRes = await pool.query(
      `SELECT
        s.id AS sale_id,
        s.sale_date,
        s.total_amount,
        c.name AS customer_name,
        c.email AS customer_email
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = $1`,
      [saleId],
    );

    if (saleRes.rows.length === 0) {
      throw new AppError('Sale not found', 404);
    }
    const sale = saleRes.rows[0];

    const itemsRes = await pool.query(
      `SELECT
        p.name AS product_name,
        si.quantity,
        si.unit_price,
        si.total_price
      FROM sale_items si
      JOIN product_variations pv ON si.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE si.sale_id = $1`,
      [saleId],
    );
    sale.items = itemsRes.rows;

    const paymentsRes = await pool.query(
      `SELECT
        payment_method,
        amount
      FROM sale_payments
      WHERE sale_id = $1`,
      [saleId],
    );
    sale.payments = paymentsRes.rows;

    let receiptContent = `
----------------------------------------------------
                RECIBO DE VENDA
----------------------------------------------------
Data da Venda: ${new Date(sale.sale_date).toLocaleString()}
ID da Venda: ${sale.sale_id}
`;

    if (sale.customer_name) {
      receiptContent += `Cliente: ${sale.customer_name}\n`;
    }
    receiptContent += `
----------------------------------------------------
Itens:
`;
    sale.items.forEach((item: any) => {
      const unitPrice = Number(item.unit_price);
      const totalPrice = Number(item.total_price);
      receiptContent += `${item.product_name} x ${item.quantity} @ R$ ${unitPrice.toFixed(2)} = R$ ${totalPrice.toFixed(2)}\n`;
    });

    const totalAmount = Number(sale.total_amount);
    receiptContent += `
----------------------------------------------------
Total: R$ ${totalAmount.toFixed(2)}
----------------------------------------------------
Pagamentos:
`;
    sale.payments.forEach((payment: any) => {
      const amount = Number(payment.amount);
      receiptContent += `${payment.payment_method.replace('_', ' ').toUpperCase()}: R$ ${amount.toFixed(2)}\n`;
    });

    receiptContent += `
----------------------------------------------------
Obrigado pela sua compra!
----------------------------------------------------
`;

    return receiptContent;
  }

  async generateFiscalNote(saleId: string): Promise<string> {
    const pool = getPool();
    const saleRes = await pool.query(
      `SELECT
        s.id AS sale_id,
        s.sale_date,
        s.total_amount,
        c.name AS customer_name,
        c.cpf AS customer_cpf
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = $1`,
      [saleId],
    );

    if (saleRes.rows.length === 0) {
      throw new AppError('Sale not found', 404);
    }
    const sale = saleRes.rows[0];

    const totalAmount = Number(sale.total_amount);
    let fiscalNoteContent = `
----------------------------------------------------
                NOTA FISCAL (SIMULADA)
----------------------------------------------------
Data da Emissão: ${new Date().toLocaleString()}
ID da Venda Associada: ${sale.sale_id}
Valor Total: R$ ${totalAmount.toFixed(2)}
`;
    if (sale.customer_name) {
      fiscalNoteContent += `Cliente: ${sale.customer_name}\n`;
    }
    if (sale.customer_cpf) {
      fiscalNoteContent += `CPF do Cliente: ${sale.customer_cpf}\n`;
    }
    fiscalNoteContent += `
----------------------------------------------------
Esta é uma nota fiscal simulada para fins de demonstração.
Não possui validade fiscal real.
----------------------------------------------------
`;
    return fiscalNoteContent;
  }

  async sendDocumentByEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"PDV System" <no-reply@pdv.com>',
        to,
        subject,
        html: htmlContent,
        text: textContent,
      });
      console.log(`Email sent to ${to} with subject: ${subject}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new AppError('Failed to send email', 500);
    }
  }
}

export const receiptService = new ReceiptService();
