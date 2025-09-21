import { io } from '../index.js'; // Import the Socket.IO server instance

export const notificationEmitter = {
  emitNewOrder(orderId: number, message: string) {
    io.emit('newOrderNotification', { orderId, message });
  },

  emitLowStock(productId: number, variationId: number, currentStock: number, threshold: number) {
    io.emit('lowStockNotification', { productId, variationId, currentStock, threshold });
  },

  // Add other notification types as needed
  emitCustomNotification(event: string, data: any) {
    io.emit(event, data);
  },
};