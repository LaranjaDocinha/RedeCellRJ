import { Request, Response } from 'express';
import { serializedItemService } from '../services/serializedItemService.js';
import csv from 'csv-stringify'; // Not used for parsing
// Using simple string split for CSV parsing to avoid extra dependencies for now, or use a stream parser if needed.
// For simplicity in this task: line-by-line parsing.

export const importSerializedItems = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const lines = fileContent.split(/\r?\n/);
    
    // Assumindo formato: serial_number, product_variation_id, branch_id
    // Header na primeira linha? Vamos assumir que sim se contiver "serial".
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    const userId = (req as any).user?.id;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Skip header
      if (i === 0 && line.toLowerCase().includes('serial')) continue;

      const [serial_number, variationIdStr, branchIdStr] = line.split(',');

      if (!serial_number || !variationIdStr || !branchIdStr) {
        results.failed++;
        results.errors.push(`Line ${i + 1}: Missing required fields`);
        continue;
      }

      try {
        await serializedItemService.createSerializedItem({
          serial_number: serial_number.trim(),
          product_variation_id: parseInt(variationIdStr.trim(), 10),
          branch_id: parseInt(branchIdStr.trim(), 10),
          status: 'in_stock',
          userId
        });
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Line ${i + 1} (${serial_number}): ${error.message}`);
      }
    }

    res.status(200).json({ message: 'Import processing complete', results });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
