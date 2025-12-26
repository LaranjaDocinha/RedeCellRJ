import { io } from '../app.js';
import appEvents from '../events/appEvents.js';

export const initSocketListeners = () => {
  // Existing sale listener
  appEvents.on('sale.created', ({ sale }) => {
    const updates = sale.items.map((item: any) => ({
      variation_id: item.variation_id,
      product_id: item.product_id,
      quantity_sold: item.quantity
    }));
    io.emit('stock_update', updates);
    console.log('Emitted stock_update event via Socket.IO');
  });

  // Kanban / Service Order Listeners
  appEvents.on('os.status.updated', ({ serviceOrder, oldStatus, newStatus, changedBy }) => {
    // Emit generic OS update for detail views
    io.emit('os_update', { id: serviceOrder.id, status: newStatus, ...serviceOrder });
    
    // Emit specific Kanban move event
    io.emit('kanban_card_moved', {
      serviceOrderId: serviceOrder.id,
      oldStatus,
      newStatus,
      technicianId: serviceOrder.technician_id,
      updatedAt: new Date()
    });
    console.log(`Emitted kanban_card_moved for OS #${serviceOrder.id} (${oldStatus} -> ${newStatus})`);
  });

  // Gamification Listeners
  appEvents.on('gamification.xp.earned', ({ userId, totalXP, achievements }) => {
    io.emit('xp_earned', { userId, totalXP, achievements });
    console.log(`[SOCKET] Emitted xp_earned for user ${userId}`);
  });

  appEvents.on('gamification.level.up', ({ userId, oldLevel, newLevel }) => {
    io.emit('level_up', { userId, oldLevel, newLevel });
    console.log(`[SOCKET] Emitted level_up for user ${userId}`);
  });
};
