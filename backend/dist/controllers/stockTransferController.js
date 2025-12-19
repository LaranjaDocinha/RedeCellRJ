import { stockTransferService } from '../services/stockTransferService.js';
import { z } from 'zod';
// Zod Schemas
const stockTransferItemSchema = z.object({
    product_variation_id: z.number().int().positive(),
    quantity: z.number().int().positive(),
});
export const createStockTransferSchema = z.object({
    origin_branch_id: z.number().int().positive(),
    destination_branch_id: z.number().int().positive(),
    notes: z.string().optional().nullable(),
    items: z.array(stockTransferItemSchema).min(1),
});
export const updateStockTransferSchema = z
    .object({
    status: z.enum(['pending', 'approved', 'in_transit', 'completed', 'cancelled']).optional(),
    notes: z.string().optional().nullable(),
    items: z.array(stockTransferItemSchema).min(1).optional(),
})
    .partial();
export const createStockTransfer = async (req, res) => {
    try {
        const validatedData = createStockTransferSchema.parse(req.body);
        const userId = req.user?.id || 1; // Mock user ID
        const newTransfer = await stockTransferService.createStockTransfer({
            ...validatedData,
            created_by_user_id: userId,
        });
        res.status(201).json(newTransfer);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};
export const getStockTransferById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido.' });
        }
        const transfer = await stockTransferService.getStockTransferById(id);
        if (!transfer) {
            return res.status(404).json({ message: 'Transferência de estoque não encontrada.' });
        }
        res.status(200).json(transfer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllStockTransfers = async (req, res) => {
    try {
        const transfers = await stockTransferService.getAllStockTransfers();
        res.status(200).json(transfers);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateStockTransfer = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido.' });
        }
        const validatedData = updateStockTransferSchema.parse(req.body);
        const updatedTransfer = await stockTransferService.updateStockTransfer(id, validatedData);
        if (!updatedTransfer) {
            return res.status(404).json({ message: 'Transferência de estoque não encontrada.' });
        }
        res.status(200).json(updatedTransfer);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};
export const deleteStockTransfer = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido.' });
        }
        const deleted = await stockTransferService.deleteStockTransfer(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Transferência de estoque não encontrada.' });
        }
        res.status(204).send(); // No Content
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
