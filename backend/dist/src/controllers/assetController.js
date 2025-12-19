import { assetService } from '../services/assetService.js';
import { z } from 'zod';
// Zod Schemas
export const createAssetSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    acquisition_date: z.string().date(),
    initial_value: z.number().positive(),
    depreciation_method: z.enum(['straight_line', 'declining_balance']).default('straight_line'),
    useful_life_years: z.number().int().positive(),
    branch_id: z.number().int().positive().optional().nullable(),
});
export const updateAssetSchema = z
    .object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    acquisition_date: z.string().date().optional(),
    initial_value: z.number().positive().optional(),
    depreciation_method: z.enum(['straight_line', 'declining_balance']).optional(),
    useful_life_years: z.number().int().positive().optional(),
    branch_id: z.number().int().positive().optional().nullable(),
})
    .partial();
export const createAsset = async (req, res) => {
    try {
        const validatedData = createAssetSchema.parse(req.body);
        const newAsset = await assetService.createAsset(validatedData);
        res.status(201).json(newAsset);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};
export const getAssetById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido.' });
        }
        const asset = await assetService.getAssetById(id);
        if (!asset) {
            return res.status(404).json({ message: 'Ativo não encontrado.' });
        }
        res.status(200).json(asset);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllAssets = async (req, res) => {
    try {
        const assets = await assetService.getAllAssets();
        res.status(200).json(assets);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateAsset = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido.' });
        }
        const validatedData = updateAssetSchema.parse(req.body);
        const updatedAsset = await assetService.updateAsset(id, validatedData);
        if (!updatedAsset) {
            return res.status(404).json({ message: 'Ativo não encontrado.' });
        }
        res.status(200).json(updatedAsset);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};
export const deleteAsset = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido.' });
        }
        const deleted = await assetService.deleteAsset(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Ativo não encontrado.' });
        }
        res.status(204).send(); // No Content
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
