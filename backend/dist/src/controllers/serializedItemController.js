import { serializedItemService } from '../services/serializedItemService.js';
import { z } from 'zod';
// Zod Schemas
export const createSerializedItemSchema = z.object({
    serial_number: z.string().min(1),
    product_variation_id: z.number().int().positive(),
    branch_id: z.number().int().positive(),
    status: z.enum(['in_stock', 'sold', 'in_repair', 'returned']).optional(),
});
export const updateSerializedItemSchema = z
    .object({
    serial_number: z.string().min(1).optional(),
    product_variation_id: z.number().int().positive().optional(),
    branch_id: z.number().int().positive().optional(),
    status: z.enum(['in_stock', 'sold', 'in_repair', 'returned']).optional(),
})
    .partial();
export const createSerializedItem = async (req, res) => {
    try {
        const validatedData = createSerializedItemSchema.parse(req.body);
        const newItem = await serializedItemService.createSerializedItem(validatedData);
        res.status(201).json(newItem);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};
export const getSerializedItemById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido.' });
        }
        const item = await serializedItemService.getSerializedItemById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item serializado não encontrado.' });
        }
        res.status(200).json(item);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getSerializedItemBySerialNumber = async (req, res) => {
    try {
        const serialNumber = req.params.serialNumber;
        const item = await serializedItemService.getSerializedItemBySerialNumber(serialNumber);
        if (!item) {
            return res.status(404).json({ message: 'Item serializado não encontrado.' });
        }
        res.status(200).json(item);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getSerializedItemHistory = async (req, res) => {
    try {
        const serialNumber = req.params.serialNumber;
        const history = await serializedItemService.getHistory(serialNumber);
        res.status(200).json(history);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllSerializedItems = async (req, res) => {
    try {
        const items = await serializedItemService.getAllSerializedItems();
        res.status(200).json(items);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getSerializedItemsByVariationId = async (req, res) => {
    try {
        const productVariationId = parseInt(req.params.productVariationId, 10);
        if (isNaN(productVariationId)) {
            return res.status(400).json({ message: 'ID da Variação do Produto inválido.' });
        }
        const items = await serializedItemService.getSerializedItemsByVariationId(productVariationId);
        res.status(200).json(items);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateSerializedItem = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido.' });
        }
        const validatedData = updateSerializedItemSchema.parse(req.body);
        const updatedItem = await serializedItemService.updateSerializedItem(id, validatedData);
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item serializado não encontrado.' });
        }
        res.status(200).json(updatedItem);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};
export const deleteSerializedItem = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido.' });
        }
        const deleted = await serializedItemService.deleteSerializedItem(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Item serializado não encontrado.' });
        }
        res.status(204).send(); // No Content
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
