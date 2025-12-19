import { Request, Response } from 'express';
import { contractService } from '../services/contractService.js';
import { saleService } from '../services/saleService.js'; // Para obter detalhes da venda
import { z } from 'zod';
import { AppError } from '../utils/errors.js';

// Esquemas de validação com Zod

const updateSaleContractSignatureSchema = z.object({
  signature_image_url: z.string().url(),
});

export const generateAndSaveContract = async (req: Request, res: Response) => {
  try {
    const saleId = parseInt(req.params.saleId, 10);
    if (isNaN(saleId)) {
      return res.status(400).json({ message: 'ID da Venda inválido.' });
    }

    const sale = await saleService.getSaleById(saleId);
    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    // Gerar o conteúdo do contrato (HTML)
    const contractHtml = await contractService.generateContractHtml({
      id: sale.id,
      customer_name: 'Nome do Cliente (buscar do customerService)', // TODO: buscar nome do cliente
      sale_date: sale.sale_date,
      total_amount: sale.total_amount,
      items: sale.items,
    });

    // Em um cenário real, você salvaria este HTML como um PDF ou arquivo estático
    // Por enquanto, vamos apenas simular o salvamento e retornar uma URL fictícia
    const contractUrl = `/contracts/${saleId}.html`; // URL fictícia

    const newContract = await contractService.createSaleContract({
      sale_id: saleId,
      contract_url: contractUrl,
    });

    res.status(201).json({
      message: 'Contract generated and saved',
      contract: newContract,
      contract_html: contractHtml,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getSaleContractById = async (req: Request, res: Response) => {
  try {
    const contractId = parseInt(req.params.id, 10);
    if (isNaN(contractId)) {
      return res.status(400).json({ message: 'ID do Contrato inválido.' });
    }
    const contract = await contractService.getSaleContractById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contrato não encontrado.' });
    }
    res.status(200).json(contract);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSaleContractsBySaleId = async (req: Request, res: Response) => {
  try {
    const saleId = parseInt(req.params.saleId, 10);
    if (isNaN(saleId)) {
      return res.status(400).json({ message: 'ID da Venda inválido.' });
    }
    const contracts = await contractService.getSaleContractsBySaleId(saleId);
    res.status(200).json(contracts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const signSaleContract = async (req: Request, res: Response) => {
  try {
    const contractId = parseInt(req.params.id, 10);
    if (isNaN(contractId)) {
      return res.status(400).json({ message: 'ID do Contrato inválido.' });
    }
    const validatedData = updateSaleContractSignatureSchema.parse(req.body);
    const updatedContract = await contractService.updateSaleContractSignature(
      contractId,
      validatedData.signature_image_url,
    );
    if (!updatedContract) {
      return res.status(404).json({ message: 'Contrato não encontrado.' });
    }
    res.status(200).json(updatedContract);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};
