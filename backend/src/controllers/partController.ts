import { Request, Response } from 'express';
import * as partService from '../services/partService.js';
import { partSupplierService } from '../services/partSupplierService.js';
import { AppError } from '../utils/errors.js';

// ... (existing controller functions: createPart, getAllParts, getPartById, updatePart, deletePart)

export const createPart = async (req: Request, res: Response) => {
  try {
    const part = await partService.createPart(req.body);
    res.status(201).json(part);
  } catch (error) {
    res.status(500).json({ message: 'Error creating part', error });
  }
};

export const getAllParts = async (req: Request, res: Response) => {
  try {
    const parts = await partService.getAllParts();
    res.status(200).json(parts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parts', error });
  }
};

export const getPartById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const part = await partService.getPartById(id);
    if (part) {
      res.status(200).json(part);
    } else {
      res.status(404).json({ message: 'Part not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching part', error });
  }
};

export const updatePart = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const part = await partService.updatePart(id, req.body);
    if (part) {
      res.status(200).json(part);
    } else {
      res.status(404).json({ message: 'Part not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating part', error });
  }
};

export const deletePart = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const success = await partService.deletePart(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Part not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting part', error });
  }
};

// --- New Supplier-specific Controller Functions ---

export const addSupplierToPart = async (req: Request, res: Response) => {
  try {
    const partId = parseInt(req.params.partId, 10);
    const { supplier_id, cost, lead_time_days, supplier_part_number } = req.body;

    if (!supplier_id || cost === undefined) {
      return res.status(400).json({ message: 'supplier_id and cost are required' });
    }

    const result = await partSupplierService.addSupplierToPart({
      part_id: partId,
      supplier_id,
      cost,
      lead_time_days,
      supplier_part_number,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error adding supplier to part', error });
  }
};

export const updateSupplierForPart = async (req: Request, res: Response) => {
  try {
    const partId = parseInt(req.params.partId, 10);
    const supplierId = parseInt(req.params.supplierId, 10);

    const result = await partSupplierService.updateSupplierForPart(partId, supplierId, req.body);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: 'Part-supplier association not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating supplier for part', error });
  }
};

export const removeSupplierFromPart = async (req: Request, res: Response) => {
  try {
    const partId = parseInt(req.params.partId, 10);
    const supplierId = parseInt(req.params.supplierId, 10);

    const success = await partSupplierService.removeSupplierFromPart(partId, supplierId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Part-supplier association not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error removing supplier from part', error });
  }
};

export const searchParts = async (req: Request, res: Response) => {
  try {
    const { searchTerm, barcode, sku } = req.query;
    const parts = await partService.searchParts(
      searchTerm as string | undefined,
      barcode as string | undefined,
      sku as string | undefined,
    );
    res.status(200).json(parts);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error searching parts', error });
  }
};
