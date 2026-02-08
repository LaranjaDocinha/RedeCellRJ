import pool from '../db/index.js';
import { z } from 'zod';

// Esquema para criar uma nova ordem de compra (simplificado para peças)
const createPurchaseOrderSchema = z.object({
  supplier_id: z.number().int(),
  status: z.enum(['pending', 'ordered', 'received', 'cancelled']).default('pending'),
  expected_delivery_date: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Esquema para um item de peça na ordem de compra
const createPurchaseOrderPartSchema = z.object({
  part_id: z.number().int(),
  quantity: z.number().int().min(1),
  unit_price: z.number().positive(),
});

type CreatePurchaseOrderPayload = z.infer<typeof createPurchaseOrderSchema>;
type CreatePurchaseOrderPartPayload = z.infer<typeof createPurchaseOrderPartSchema>;

export { createPurchaseOrderSchema, createPurchaseOrderPartSchema };

/**
 * Verifica o estoque de uma peça e retorna a quantidade disponível.
 * @param partId ID da peça
 * @returns Quantidade em estoque
 */
export const getPartStockQuantity = async (partId: number): Promise<number> => {
  const res = await pool.query('SELECT stock_quantity FROM parts WHERE id = $1', [partId]);
  return res.rows[0]?.stock_quantity || 0;
};

/**
 * Cria uma nova ordem de compra para peças.
 * @param purchaseOrderData Dados da ordem de compra
 * @param parts Itens de peças a serem incluídos na ordem
 * @returns A nova ordem de compra criada
 */
export const createPurchaseOrderForParts = async (
  purchaseOrderData: CreatePurchaseOrderPayload,
  parts: CreatePurchaseOrderPartPayload[],
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { supplier_id, status, expected_delivery_date, notes } = purchaseOrderData;
    const poRes = await client.query(
      'INSERT INTO purchase_orders (supplier_id, status, expected_delivery_date, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [supplier_id, status, expected_delivery_date, notes],
    );
    const newPurchaseOrder = poRes.rows[0];

    for (const part of parts) {
      const { part_id, quantity, unit_price } = part;
      await client.query(
        'INSERT INTO purchase_order_parts (purchase_order_id, part_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [newPurchaseOrder.id, part_id, quantity, unit_price],
      );
    }

    await client.query('COMMIT');
    return newPurchaseOrder;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Verifica as peças necessárias para uma ordem de serviço e cria ordens de compra se o estoque for baixo.
 * @param serviceOrderId ID da ordem de serviço
 */
export const checkAndRequestPartsForServiceOrder = async (serviceOrderId: number) => {
  // 1. Obter todas as peças necessárias para a ordem de serviço
  const serviceOrderPartsRes = await pool.query(
    `SELECT soi.part_id, soi.quantity, p.stock_quantity, p.supplier_id, p.cost_price
     FROM service_order_items soi
     JOIN parts p ON soi.part_id = p.id
     WHERE soi.service_order_id = $1 AND soi.part_id IS NOT NULL`,
    [serviceOrderId],
  );

  const partsToOrder: { [supplierId: number]: CreatePurchaseOrderPartPayload[] } = {};

  for (const item of serviceOrderPartsRes.rows) {
    const { part_id, quantity, stock_quantity, supplier_id, cost_price } = item;

    if (stock_quantity < quantity) {
      const neededQuantity = quantity - stock_quantity;
      if (!partsToOrder[supplier_id]) {
        partsToOrder[supplier_id] = [];
      }
      partsToOrder[supplier_id].push({
        part_id,
        quantity: neededQuantity,
        unit_price: cost_price,
      });
    }
  }

  // 2. Criar ordens de compra para cada fornecedor com peças a serem requisitadas
  const createdPurchaseOrders = [];
  for (const supplierId in partsToOrder) {
    if (Object.prototype.hasOwnProperty.call(partsToOrder, supplierId)) {
      const parts = partsToOrder[supplierId];
      const purchaseOrderData: CreatePurchaseOrderPayload = {
        supplier_id: parseInt(supplierId, 10),
        status: 'pending',
        notes: `Requisição automática de peças para Ordem de Serviço #${serviceOrderId}`,
      };
      const newPO = await createPurchaseOrderForParts(purchaseOrderData, parts);
      createdPurchaseOrders.push(newPO);
    }
  }

  return createdPurchaseOrders;
};
