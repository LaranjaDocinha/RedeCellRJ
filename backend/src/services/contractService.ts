import pool from '../db/index.js';
import { z } from 'zod';

// Esquema para criar um contrato de venda
const createSaleContractSchema = z.object({
  sale_id: z.number().int(),
  contract_url: z.string().url(),
  signature_image_url: z.string().url().optional().nullable(),
  signed_at: z.string().datetime().optional().nullable(),
});

type CreateSaleContractPayload = z.infer<typeof createSaleContractSchema>;

export const contractService = {
  /**
   * Gera um contrato HTML/PDF com base em um template e dados da venda.
   * (Implementação simplificada, em um cenário real usaria um motor de templates)
   * @param saleData Dados da venda para preencher o contrato.
   * @returns Conteúdo do contrato (HTML).
   */
  async generateContractHtml(saleData: any): Promise<string> {
    // Exemplo simples de template HTML
    const contractHtml = `
      <h1>Contrato de Venda #${saleData.id}</h1>
      <p>Cliente: ${saleData.customer_name}</p>
      <p>Data da Venda: ${saleData.sale_date}</p>
      <p>Valor Total: R$ ${saleData.total_amount}</p>
      <p>Itens:</p>
      <ul>
        ${saleData.items.map((item: any) => `<li>${item.quantity}x ${item.product_name} - R$ ${item.price_at_sale}</li>`).join('')}
      </ul>
      <p>Termos e Condições...</p>
      <p>Assinatura do Cliente: _________________________</p>
    `;
    return contractHtml;
  },

  /**
   * Salva um contrato de venda no banco de dados.
   * @param data Dados do contrato a ser salvo.
   * @returns O contrato de venda salvo.
   */
  async createSaleContract(data: CreateSaleContractPayload) {
    const { sale_id, contract_url, signature_image_url, signed_at } = data;
    const res = await pool.query(
      'INSERT INTO sale_contracts (sale_id, contract_url, signature_image_url, signed_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [sale_id, contract_url, signature_image_url, signed_at],
    );
    return res.rows[0];
  },

  /**
   * Obtém um contrato de venda pelo ID.
   * @param contractId ID do contrato.
   * @returns O contrato de venda.
   */
  async getSaleContractById(contractId: number) {
    const res = await pool.query('SELECT * FROM sale_contracts WHERE id = $1', [contractId]);
    return res.rows[0];
  },

  /**
   * Obtém todos os contratos de uma venda.
   * @param saleId ID da venda.
   * @returns Lista de contratos da venda.
   */
  async getSaleContractsBySaleId(saleId: number) {
    const res = await pool.query(
      'SELECT * FROM sale_contracts WHERE sale_id = $1 ORDER BY created_at DESC',
      [saleId],
    );
    return res.rows;
  },

  /**
   * Atualiza um contrato de venda (por exemplo, adicionando a assinatura).
   * @param contractId ID do contrato.
   * @param signatureImageUrl URL da imagem da assinatura.
   * @returns O contrato de venda atualizado.
   */
  async updateSaleContractSignature(contractId: number, signatureImageUrl: string) {
    const res = await pool.query(
      'UPDATE sale_contracts SET signature_image_url = $1, signed_at = current_timestamp, updated_at = current_timestamp WHERE id = $2 RETURNING *',
      [signatureImageUrl, contractId],
    );
    return res.rows[0];
  },
};
