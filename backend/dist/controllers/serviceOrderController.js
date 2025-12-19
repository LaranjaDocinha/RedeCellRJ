import * as serviceOrderService from '../services/serviceOrderService.js';
export const createServiceOrder = async (req, res) => {
    try {
        // Assuming user ID is available in req.user from an auth middleware
        const userId = req.user?.id || 1; // Fallback to 1 for now
        const orderData = { ...req.body, user_id: userId };
        const order = await serviceOrderService.createServiceOrder(orderData);
        res.status(201).json(order);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating service order' });
    }
};
export const getAllServiceOrders = async (req, res) => {
    try {
        const filters = req.query; // e.g., /api/service-orders?status=Em Reparo
        const orders = await serviceOrderService.getAllServiceOrders(filters);
        res.status(200).json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching service orders' });
    }
};
export const getServiceOrderById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const order = await serviceOrderService.getServiceOrderById(id);
        if (order) {
            res.status(200).json(order);
        }
        else {
            res.status(404).json({ message: 'Service order not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching service order' });
    }
};
export const addOrderItem = async (req, res) => {
    try {
        const serviceOrderId = parseInt(req.params.id, 10);
        const newItem = await serviceOrderService.addOrderItem(serviceOrderId, req.body);
        res.status(201).json(newItem);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding item to service order' });
    }
};
export const updateServiceOrder = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const updatedOrder = await serviceOrderService.updateServiceOrder(id, req.body);
        if (updatedOrder) {
            res.status(200).json(updatedOrder);
        }
        else {
            res.status(404).json({ message: 'Service order not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating service order' });
    }
};
export const changeOrderStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { newStatus } = req.body;
        // Assuming user ID is available in req.user from an auth middleware
        const userId = req.user?.id || 1; // Fallback to 1 for now
        if (!newStatus) {
            return res.status(400).json({ message: 'newStatus is required' });
        }
        const updatedOrder = await serviceOrderService.changeOrderStatus(id, newStatus, userId);
        if (updatedOrder) {
            res.status(200).json(updatedOrder);
        }
        else {
            res.status(404).json({ message: 'Service order not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error changing service order status' });
    }
};
export const suggestTechnician = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const suggestions = await serviceOrderService.suggestTechnician(id);
        res.json(suggestions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error suggesting technician' });
    }
};
export const addComment = async (req, res) => {
    try {
        const serviceOrderId = parseInt(req.params.id, 10);
        const userId = req.user?.id || 1; // Mock user ID
        const { comment_text } = req.body;
        const comment = await serviceOrderService.addComment(serviceOrderId, userId, comment_text);
        res.status(201).json(comment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding comment' });
    }
};
export const getComments = async (req, res) => {
    try {
        const serviceOrderId = parseInt(req.params.id, 10);
        const comments = await serviceOrderService.getComments(serviceOrderId);
        res.json(comments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
};
export const addServiceOrderVideoAttachment = async (req, res) => {
    try {
        const serviceOrderId = parseInt(req.params.id, 10);
        if (isNaN(serviceOrderId)) {
            return res.status(400).json({ message: 'ID de Ordem de Serviço inválido.' });
        }
        const { filePath, fileType, description } = req.body; // filePath virá do upload, fileType e description do body
        const userId = req.user?.id || 1; // Mock user ID
        if (!filePath || !fileType) {
            return res.status(400).json({ message: 'filePath e fileType são obrigatórios.' });
        }
        const attachment = await serviceOrderService.addServiceOrderAttachment(serviceOrderId, filePath, fileType, description, userId);
        res.status(201).json(attachment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding video attachment to service order' });
    }
};
