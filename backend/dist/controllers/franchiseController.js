import * as franchiseService from '../services/franchiseService.js';
export const createFranchise = async (req, res) => {
    try {
        const { name, address, contact_person, contact_email } = req.body;
        const franchise = await franchiseService.createFranchise(name, address, contact_person, contact_email);
        res.status(201).json(franchise);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateFranchiseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        const franchise = await franchiseService.updateFranchiseStatus(parseInt(id, 10), is_active);
        if (franchise) {
            res.json(franchise);
        }
        else {
            res.status(404).json({ message: 'Franchise not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deleteFranchise = async (req, res) => {
    try {
        const { id } = req.params;
        const franchise = await franchiseService.deleteFranchise(parseInt(id, 10));
        if (franchise) {
            res.json({ message: 'Franchise deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Franchise not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getFranchises = async (req, res) => {
    try {
        const franchises = await franchiseService.getFranchises();
        res.json(franchises);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getConsolidatedReports = async (req, res) => {
    try {
        const reports = await franchiseService.getConsolidatedReports();
        res.json(reports);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getFranchiseSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const settings = await franchiseService.getFranchiseSettings(parseInt(id, 10));
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
