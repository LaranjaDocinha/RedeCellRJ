import { Request, Response } from 'express';
import { serviceOrderService } from '../services/serviceOrderService.js';
import { ServiceOrderStatus } from '../types/serviceOrder.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const createServiceOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 'User not authenticated', 'UNAUTHENTICATED', 401);
    }
    const orderData = { ...req.body, user_id: userId };
    const order = await serviceOrderService.createServiceOrder(orderData);
    return sendSuccess(res, order, 201);
  } catch (error: any) {
    console.error('Controller createServiceOrder error:', error.message);
    return sendError(
      res,
      error.message || 'Error creating service order',
      error.code || 'INTERNAL_ERROR',
      error.statusCode || 500,
    );
  }
};

export const getAllServiceOrders = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const orders = await serviceOrderService.getAllServiceOrders(filters);
    return sendSuccess(res, orders);
  } catch (error: any) {
    console.error(error);
    return sendError(res, 'Error fetching service orders', 'INTERNAL_ERROR', 500);
  }
};

export const getServiceOrderById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const order = await serviceOrderService.getServiceOrderById(id);
    if (order) {
      return sendSuccess(res, order);
    } else {
      return sendError(res, 'Service order not found', 'NOT_FOUND', 404);
    }
  } catch (error: any) {
    console.error(error);
    return sendError(res, 'Error fetching service order', 'INTERNAL_ERROR', 500);
  }
};

export const addOrderItem = async (req: Request, res: Response) => {
  try {
    const serviceOrderId = parseInt(req.params.id, 10);
    const newItem = await serviceOrderService.addOrderItem(serviceOrderId, req.body);
    return sendSuccess(res, newItem, 201);
  } catch (error: any) {
    console.error(error);
    return sendError(res, 'Error adding item to service order', 'INTERNAL_ERROR', 500);
  }
};

export const updateServiceOrder = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedOrder = await serviceOrderService.updateServiceOrder(id, req.body);
    if (updatedOrder) {
      return sendSuccess(res, updatedOrder);
    } else {
      return sendError(res, 'Service order not found', 'NOT_FOUND', 404);
    }
  } catch (error: any) {
    console.error(error);
    return sendError(res, 'Error updating service order', 'INTERNAL_ERROR', 500);
  }
};

export const changeOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { newStatus } = req.body;
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 'User not authenticated', 'UNAUTHENTICATED', 401);
    }

    if (!newStatus) {
      return sendError(res, 'newStatus is required', 'VALIDATION_ERROR', 400);
    }

    const updatedOrder = await serviceOrderService.changeOrderStatus(
      id,
      newStatus as ServiceOrderStatus,
      userId,
    );
    if (updatedOrder) {
      return sendSuccess(res, updatedOrder);
    } else {
      return sendError(res, 'Service order not found', 'NOT_FOUND', 404);
    }
  } catch (error: any) {
    console.error(error);
    return sendError(res, 'Error changing service order status', 'INTERNAL_ERROR', 500);
  }
};

export const suggestTechnician = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const suggestions = await serviceOrderService.suggestTechnician(id);
    return sendSuccess(res, suggestions);
  } catch (error: any) {
    console.error(error);
    return sendError(res, 'Error suggesting technician', 'INTERNAL_ERROR', 500);
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const serviceOrderId = parseInt(req.params.id, 10);
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 'User not authenticated', 'UNAUTHENTICATED', 401);
    }
    const { comment_text } = req.body;
    const comment = await serviceOrderService.addComment(serviceOrderId, userId, comment_text);
    return sendSuccess(res, comment, 201);
  } catch (error: any) {
    console.error(error);
    return sendError(res, 'Error adding comment', 'INTERNAL_ERROR', 500);
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const serviceOrderId = parseInt(req.params.id, 10);
    const comments = await serviceOrderService.getComments(serviceOrderId);
    return sendSuccess(res, comments);
  } catch (error: any) {
    console.error(error);
    return sendError(res, 'Error fetching comments', 'INTERNAL_ERROR', 500);
  }
};

export const addServiceOrderVideoAttachment = async (req: Request, res: Response) => {
  try {
    const serviceOrderId = parseInt(req.params.id, 10);
    if (isNaN(serviceOrderId)) {
      return sendError(res, 'ID de Ordem de Serviço inválido.', 'VALIDATION_ERROR', 400);
    }
    const { filePath, fileType, description } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return sendError(res, 'User not authenticated', 'UNAUTHENTICATED', 401);
    }

    if (!filePath || !fileType) {
      return sendError(res, 'filePath e fileType são obrigatórios.', 'VALIDATION_ERROR', 400);
    }

    const attachment = await serviceOrderService.addServiceOrderAttachment(
      serviceOrderId,
      filePath,
      fileType,
      description,
      userId,
    );
    return sendSuccess(res, attachment, 201);
  } catch (error: any) {
    console.error(error);
    return sendError(res, 'Error adding video attachment to service order', 'INTERNAL_ERROR', 500);
  }
};
