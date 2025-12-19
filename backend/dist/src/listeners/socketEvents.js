import { io } from '../app.js';
import appEvents from '../events/appEvents.js';
export const initSocketListeners = () => {
    appEvents.on('sale.created', ({ sale }) => {
        // Emit stock update to all connected clients
        // sale.items contains the products and quantities sold
        const updates = sale.items.map((item) => ({
            variation_id: item.variation_id,
            product_id: item.product_id,
            quantity_sold: item.quantity
        }));
        io.emit('stock_update', updates);
        console.log('Emitted stock_update event via Socket.IO');
    });
};
