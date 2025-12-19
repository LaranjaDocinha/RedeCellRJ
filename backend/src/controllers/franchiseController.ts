import { Request, Response } from 'express';
import * as franchiseService from '../services/franchiseService.js';

export const createFranchise = async (req: Request, res: Response) => {
  try {
    const { name, address, contact_person, contact_email } = req.body;
    const franchise = await franchiseService.createFranchise(
      name,
      address,
      contact_person,
      contact_email,
    );
    res.status(201).json(franchise);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFranchiseStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const franchise = await franchiseService.updateFranchiseStatus(parseInt(id, 10), is_active);
    if (franchise) {
      res.json(franchise);
    } else {
      res.status(404).json({ message: 'Franchise not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFranchise = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const franchise = await franchiseService.deleteFranchise(parseInt(id, 10));
    if (franchise) {
      res.json({ message: 'Franchise deleted successfully' });
    } else {
      res.status(404).json({ message: 'Franchise not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFranchises = async (req: Request, res: Response) => {
  try {
    const franchises = await franchiseService.getFranchises();
    res.json(franchises);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getConsolidatedReports = async (req: Request, res: Response) => {
  try {
    const reports = await franchiseService.getConsolidatedReports();
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFranchiseSettings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const settings = await franchiseService.getFranchiseSettings(parseInt(id, 10));
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
