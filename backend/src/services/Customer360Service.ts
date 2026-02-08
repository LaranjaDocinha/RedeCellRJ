import pool from '../db/index.js';

export interface TimelineEvent {
  id: string;
  date: Date;
  type: 'sale' | 'os' | 'print' | 'loyalty' | 'communication';
  title: string;
  description: string;
  value?: string;
  status?: string;
}

export class Customer360Service {
  async getTimeline(customerId: number): Promise<TimelineEvent[]> {
    const client = await pool.connect();
    try {
      const events: TimelineEvent[] = [];

      // 1. Vendas
      const sales = await client.query(
        'SELECT id, sale_date, total_amount FROM sales WHERE customer_id = $1',
        [customerId],
      );
      sales.rows.forEach((s) =>
        events.push({
          id: `sale-${s.id}`,
          date: new Date(s.sale_date),
          type: 'sale',
          title: 'Compra Realizada',
          description: `Venda #${s.id}`,
          value: `R$ ${s.total_amount}`,
        }),
      );

      // 2. Ordens de Serviço
      const orders = await client.query(
        'SELECT id, created_at, product_description, status, estimated_cost FROM service_orders WHERE customer_id = $1',
        [customerId],
      );
      orders.rows.forEach((o) =>
        events.push({
          id: `os-${o.id}`,
          date: new Date(o.created_at),
          type: 'os',
          title: 'Ordem de Serviço',
          description: o.product_description,
          status: o.status,
          value: o.estimated_cost ? `R$ ${o.estimated_cost}` : undefined,
        }),
      );

      // 3. Impressões
      const customerRes = await client.query('SELECT name FROM customers WHERE id = $1', [
        customerId,
      ]);
      if (customerRes.rows[0]) {
        const prints = await client.query(
          'SELECT id, created_at, description, quantity FROM print_jobs WHERE customer_name = $1',
          [customerRes.rows[0].name],
        );
        prints.rows.forEach((p) =>
          events.push({
            id: `print-${p.id}`,
            date: new Date(p.created_at),
            type: 'print',
            title: 'Serviço de Impressão',
            description: p.description,
            value: `${p.quantity} un`,
          }),
        );
      }

      return events.sort((a, b) => b.date.getTime() - a.date.getTime());
    } finally {
      client.release();
    }
  }

  async getCustomer360View(customerId: number) {
    const client = await pool.connect();
    try {
      const customerRes = await client.query('SELECT * FROM customers WHERE id = $1', [customerId]);
      if (customerRes.rows.length === 0) return null;

      const timeline = await this.getTimeline(customerId);

      return {
        profile: customerRes.rows[0],
        loyalty: { points: customerRes.rows[0].loyalty_points || 0 },
        timeline,
      };
    } finally {
      client.release();
    }
  }
}

export const customer360Service = new Customer360Service();
