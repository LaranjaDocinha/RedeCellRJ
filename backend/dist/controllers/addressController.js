import * as addressService from '../services/addressService.js';
export const createAddress = async (req, res) => {
    try {
        const { customerId } = req.params;
        const address = await addressService.createAddress(parseInt(customerId, 10), req.body);
        res.status(201).json(address);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const address = await addressService.updateAddress(parseInt(id, 10), req.body);
        if (address) {
            res.json(address);
        }
        else {
            res.status(404).json({ message: 'Address not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const address = await addressService.deleteAddress(parseInt(id, 10));
        if (address) {
            res.json({ message: 'Address deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Address not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAddressesByCustomerId = async (req, res) => {
    try {
        const { customerId } = req.params;
        const addresses = await addressService.getAddressesByCustomerId(parseInt(customerId, 10));
        res.json(addresses);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
