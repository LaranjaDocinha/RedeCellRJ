import { Request, Response } from 'express';
import * as ofxService from '../services/ofxService.js';

export const uploadOfx = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const transactions = await ofxService.parseOfxFile(req.file.path);

    // Para cada transação, buscar sugestões de conciliação
    const results = await Promise.all(transactions.map((tx) => ofxService.findMatches(tx)));

    res.json(results);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error processing OFX file', error: error.message });
  }
};
