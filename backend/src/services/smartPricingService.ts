import { getPool } from '../db/index.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js'; // Importar AppError

interface PricingRulePayload {
  name: string;
  condition_type: string;
  condition_value: any; // JSONB
  action_type: string;
  action_value: number;
  is_active?: boolean;
  priority?: number;
}

export const smartPricingService = {
  /**
   * Executa a rotina de precificação inteligente.
   * Deve ser chamado via Cron Job (ex: toda madrugada).
   */
  async runPricingRoutine() {
    const pool = getPool();
    logger.info('[SmartPricing] Starting pricing routine...');

    // 1. Buscar regras ativas
    const rulesRes = await pool.query('SELECT * FROM pricing_rules WHERE is_active = TRUE ORDER BY priority DESC');
    const rules = rulesRes.rows;

    if (rules.length === 0) {
      logger.info('[SmartPricing] No active rules found.');
      return;
    }

    // 2. Para cada regra, encontrar produtos aplicáveis
    for (const rule of rules) {
      await this.applyRule(rule);
    }

    logger.info('[SmartPricing] Routine completed.');
  },

  async applyRule(rule: any) {
    const pool = getPool();
    const { condition_type, condition_value, action_type, action_value, name } = rule;

    logger.info(`[SmartPricing] Applying rule: ${name}`);

    let productsToUpdate: any[] = [];

    // Lógica de Seleção de Produtos baseada na Condição
    if (condition_type === 'low_turnover') {
      // Ex: Produtos sem vendas nos últimos X dias
      const days = condition_value.days_without_sale || 30;
      
      const query = `
        SELECT pv.id, pv.price, pv.cost_price, pv.sku 
        FROM product_variations pv
        LEFT JOIN sale_items si ON pv.id = si.variation_id
        LEFT JOIN sales s ON si.sale_id = s.id
        WHERE pv.stock_quantity > 0
        GROUP BY pv.id
        HAVING MAX(s.sale_date) < NOW() - INTERVAL '${days} days' OR MAX(s.sale_date) IS NULL
      `;
      
      const res = await pool.query(query);
      productsToUpdate = res.rows;
    } 
    else if (condition_type === 'high_stock') {
        const minStock = condition_value.min_stock || 100;
        const res = await pool.query('SELECT id, price, cost_price, sku FROM product_variations WHERE stock_quantity >= $1', [minStock]);
        productsToUpdate = res.rows;
    }
    // Adicionar outras condições aqui (ex: 'seasonal_demand', 'competitor_price')

    logger.info(`[SmartPricing] Found ${productsToUpdate.length} candidates for rule ${name}`);

    // Aplicar Ação (Alteração de Preço)
    for (const product of productsToUpdate) {
        let newPrice = Number(product.price);

        if (action_type === 'discount_percentage') {
            newPrice = newPrice * (1 - (action_value / 100));
        } else if (action_type === 'markup_percentage') {
            // Ex: Garantir margem mínima sobre custo
            const minPrice = Number(product.cost_price) * (1 + (action_value / 100));
            if (newPrice < minPrice) newPrice = minPrice; 
        }
        // Adicionar outras ações aqui (ex: 'set_fixed_price')

        // Proteção: Nunca vender abaixo do custo (salvo configuração explícita)
        if (newPrice < Number(product.cost_price) && newPrice < Number(product.price)) { // Ajuste para não subir preço abaixo do custo se já estiver assim
            logger.warn(`[SmartPricing] Skipped ${product.sku}: New price ${newPrice} below cost ${product.cost_price}. Product will not be sold at a loss.`);
            continue;
        }

        // Atualizar se houve mudança e se o novo preço não é excessivamente baixo/alto
        if (newPrice !== Number(product.price)) {
            await this.updateProductPrice(product.id, Number(product.price), newPrice, `SmartPricing: ${name}`);
        }
    }
  },

  async updateProductPrice(variationId: number, oldPrice: number, newPrice: number, reason: string, userId?: string) {
      const pool = getPool();
      const client = await pool.connect();
      
      try {
          await client.query('BEGIN');

          // Atualiza Produto
          await client.query('UPDATE product_variations SET price = $1, updated_at = NOW() WHERE id = $2', [newPrice, variationId]);

          // Registra Histórico
          await client.query(
              'INSERT INTO price_history (variation_id, old_price, new_price, reason, changed_by) VALUES ($1, $2, $3, $4, $5)',
              [variationId, oldPrice, newPrice, reason, userId]
          );

          await client.query('COMMIT');
          logger.info(`[SmartPricing] Updated variation ${variationId} from ${oldPrice} to ${newPrice}`);
      } catch (error) {
          await client.query('ROLLBACK');
          logger.error(`[SmartPricing] Error updating price for variation ${variationId}`, error);
          throw error; // Re-lançar o erro após rollback
      } finally {
          client.release();
      }
  },

  // --- CRUD para Regras de Precificação ---

  async getAllPricingRules() {
    const pool = getPool();
    const res = await pool.query('SELECT * FROM pricing_rules ORDER BY priority DESC, name ASC');
    return res.rows;
  },

  async getPricingRuleById(id: number) {
    const pool = getPool();
    const res = await pool.query('SELECT * FROM pricing_rules WHERE id = $1', [id]);
    return res.rows[0];
  },

  async createPricingRule(payload: PricingRulePayload) {
    const pool = getPool();
    const { name, condition_type, condition_value, action_type, action_value, is_active = true, priority = 0 } = payload;
    const res = await pool.query(
      `INSERT INTO pricing_rules (name, condition_type, condition_value, action_type, action_value, is_active, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, condition_type, condition_value, action_type, action_value, is_active, priority]
    );
    return res.rows[0];
  },

  async updatePricingRule(id: number, updates: Partial<PricingRulePayload>) {
    const pool = getPool();
    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (updates.name !== undefined) { fields.push(`name = $${queryIndex++}`); values.push(updates.name); }
    if (updates.condition_type !== undefined) { fields.push(`condition_type = $${queryIndex++}`); values.push(updates.condition_type); }
    if (updates.condition_value !== undefined) { fields.push(`condition_value = $${queryIndex++}`); values.push(updates.condition_value); }
    if (updates.action_type !== undefined) { fields.push(`action_type = $${queryIndex++}`); values.push(updates.action_type); }
    if (updates.action_value !== undefined) { fields.push(`action_value = $${queryIndex++}`); values.push(updates.action_value); }
    if (updates.is_active !== undefined) { fields.push(`is_active = $${queryIndex++}`); values.push(updates.is_active); }
    if (updates.priority !== undefined) { fields.push(`priority = $${queryIndex++}`); values.push(updates.priority); }
    
    if (fields.length === 0) {
      const current = await this.getPricingRuleById(id);
      if (!current) throw new AppError('Pricing rule not found', 404);
      return current;
    }

    values.push(id); // ID é o último valor para o WHERE
    const res = await pool.query(
      `UPDATE pricing_rules SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${queryIndex} RETURNING *`,
      values
    );
    if (res.rows.length === 0) throw new AppError('Pricing rule not found', 404);
    return res.rows[0];
  },

  async deletePricingRule(id: number) {
    const pool = getPool();
    const res = await pool.query('DELETE FROM pricing_rules WHERE id = $1 RETURNING id', [id]);
    if (res.rows.length === 0) throw new AppError('Pricing rule not found', 404);
    return { success: true };
  }
};
