import { io } from '../index.js'; // Import the Socket.IO server instance
export const notificationEmitter = {
    emitNewOrder(orderId, message) {
        io.emit('newOrderNotification', { orderId, message });
    },
    emitLowStock(productId, variationId, currentStock, threshold) {
        io.emit('lowStockNotification', { productId, variationId, currentStock, threshold });
    },
    // Add other notification types as needed
    emitCustomNotification(event, data) {
        io.emit(event, data);
    },
};
