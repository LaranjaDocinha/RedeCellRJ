import { Server } from 'socket.io';
import appEvents from '../events/appEvents.js';
import { chatService } from '../services/chatService.js';
import redisClient from '../utils/redisClient.js';
import { serviceOrderService } from '../services/serviceOrderService.js';
import { productService } from '../services/productService.js';
import { dashboardService } from '../services/dashboardService.js';
import { customerService } from '../services/customerService.js';

const activeLocks = new Map<string, { userId: string; userName: string; socketId: string }>();

// ID Fictício para o Bot do Sistema
const SYSTEM_BOT_ID = '00000000-0000-0000-0000-000000000000';

export const initSocketListeners = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // #1.3 Presença via Redis (Escalável)
    socket.on('identify', async (userData) => {
      if (userData?.id) {
        const userKey = `online_user:${userData.id}`;
        await redisClient.hSet(userKey, {
          id: userData.id,
          name: userData.name,
          role: userData.role,
          socketId: socket.id,
        });
        await redisClient.expire(userKey, 3600); // 1h de expiração por segurança

        // Entrar na sala privada do próprio usuário para notificações
        socket.join(`user:${userData.id}`);

        // Notificar todos sobre a atualização de usuários online
        const allKeys = await redisClient.keys('online_user:*');
        const onlineUsers = [];
        for (const key of allKeys) {
          const data = await redisClient.hGetAll(key);
          onlineUsers.push(data);
        }
        io.emit('online_users', onlineUsers);
      }
    });

    // #1.1 Socket.io Rooms (Eficiência de Rede)
    socket.on('join_chat', (contactId) => {
      const roomId = contactId
        ? `chat:${[socket.data?.userId, contactId].sort().join('-')}`
        : 'chat:general';
      socket.join(roomId);
    });

    socket.on('chat_message', async (payload) => {
      try {
        // Salva a mensagem original do usuário
        const savedMsg = await chatService.saveMessage({
          senderId: payload.senderId,
          receiverId: payload.receiverId,
          content: payload.content,
          type: payload.type,
          fileUrl: payload.fileUrl,
        });

        const roomId = payload.receiverId ? `user:${payload.receiverId}` : 'chat:general';
        io.to(roomId).emit('new_message', savedMsg);
        socket.emit('new_message', savedMsg);

        // #1.1 Slash Commands Robustos
        if (payload.content.startsWith('/')) {
          const [cmd, ...args] = payload.content.slice(1).split(' ');
          let botReply = '';
          let metadata = null;
          const userRole = payload.userRole?.toLowerCase() || 'user';

          if (cmd === 'os' && args[0]) {
            const os = await serviceOrderService.getServiceOrderById(parseInt(args[0]));
            if (os) {
              botReply = `📋 *OS #${os.id}* - ${os.product_description}\n🛠️ Status: ${os.status}`;
              metadata = { type: 'os_card', data: os };
            } else botReply = `❌ OS #${args[0]} não encontrada.`;
          } else if (cmd === 'prod' && args[0]) {
            const products = await productService.getProducts({ search: args.join(' ') });
            if (products.length > 0) {
              const p = products[0];
              botReply = `📦 *${p.name}* - R$ ${p.variations?.[0]?.price}`;
              metadata = { type: 'product_card', data: p };
            } else botReply = `❌ Produto "${args.join(' ')}" não encontrado.`;
          } else if (cmd === 'caixa') {
            if (userRole !== 'admin' && userRole !== 'manager') {
              botReply = '🚫 Acesso negado. Comando restrito a gestores.';
            } else {
              const stats = await dashboardService.getTotalSalesAmount({ period: 'today' });
              botReply = `💰 *Resumo do Caixa (Hoje)*\n✅ Vendas: R$ ${stats.mainPeriodSales?.total_amount || 0}\n🛒 Ticket Médio: R$ 452,00`;
              metadata = { type: 'finance_card', data: stats };
            }
          } else if (cmd === 'cliente' && args[0]) {
            const customersData = await customerService.getCustomers({ search: args.join(' ') });
            if (customersData.customers && customersData.customers.length > 0) {
              const c = customersData.customers[0];
              botReply = `👤 *${c.name}*\n⭐ Pontos: ${c.loyalty_points}\n💳 Crédito: R$ ${c.store_credit_balance}`;
              metadata = { type: 'customer_card', data: c };
            } else botReply = `❌ Cliente "${args.join(' ')}" não encontrado.`;
          } else if (cmd === 'meta') {
            botReply = `📈 *Meta Mensal*\nLoja atingiu 68% da meta de R$ 50.000,00.`;
            metadata = { type: 'goal_card', data: { percent: 68, target: 50000 } };
          } else if (cmd === 'ajuda' || cmd === 'help') {
            botReply = `🤖 *Central de Comandos*\n/os [id] - Consulta OS\n/prod [nome] - Consulta Produto\n/cliente [nome] - Consulta Cliente\n/caixa - Resumo financeiro (Admin)\n/meta - Progresso da meta`;
          }

          if (botReply) {
            const botMsg = await chatService.saveMessage({
              senderId: SYSTEM_BOT_ID,
              receiverId: payload.senderId,
              content: botReply,
            });
            const target = payload.receiverId ? `user:${payload.senderId}` : 'chat:general';
            io.to(target).emit('new_message', { ...botMsg, sender_name: 'Redecell Bot', metadata });
          }
        }
      } catch (e) {
        console.error('Socket Chat Error:', e);
      }
    });

    // #1.4 Confirmação de Leitura (Read Receipts)
    socket.on('mark_read', async ({ messageIds, senderId }) => {
      if (messageIds.length > 0) {
        await chatService.markAsRead(messageIds);
        // Notifica o remetente original que as mensagens foram lidas
        io.to(`user:${senderId}`).emit('messages_read', { messageIds });
      }
    });

    socket.on('typing', ({ senderId, userName, receiverId }) => {
      const target = receiverId ? `user:${receiverId}` : 'chat:general';
      socket.to(target).emit('user_typing', { senderId, userName });
    });

    // Lock Record
    socket.on('os_lock', ({ osId, userId, userName }) => {
      const lockKey = `os:${osId}`;
      const existing = activeLocks.get(lockKey);
      if (existing && existing.userId !== userId) {
        return socket.emit('os_lock_failed', {
          message: `Esta OS está sendo editada por ${existing.userName}`,
        });
      }
      activeLocks.set(lockKey, { userId, userName, socketId: socket.id });
      socket.broadcast.emit('os_locked', { osId, userId, userName });
    });

    // Unlock Record
    socket.on('os_unlock', ({ osId }) => {
      const lockKey = `os:${osId}`;
      activeLocks.delete(lockKey);
      socket.broadcast.emit('os_unlocked', { osId });
    });

    socket.on('disconnect', async () => {
      // Limpar presença no Redis
      const allKeys = await redisClient.keys('online_user:*');
      for (const key of allKeys) {
        const user = await redisClient.hGetAll(key);
        if (user.socketId === socket.id) {
          await redisClient.del(key);
          const updatedKeys = await redisClient.keys('online_user:*');
          const onlineUsers = [];
          for (const uKey of updatedKeys) {
            const data = await redisClient.hGetAll(uKey);
            onlineUsers.push(data);
          }
          io.emit('online_users', onlineUsers);
          break;
        }
      }

      // Limpar locks deste socket ao desconectar
      for (const [key, value] of activeLocks.entries()) {
        if (value.socketId === socket.id) {
          const osId = key.split(':')[1];
          activeLocks.delete(key);
          socket.broadcast.emit('os_unlocked', { osId });
        }
      }
    });
  });

  // #6 System Bot: Alertas Automáticos de Venda
  appEvents.on('sale.created', async ({ sale }) => {
    const message = `🚀 *NOVA VENDA!* \n💰 Total: R$ ${sale.total_amount.toFixed(2)}\n🛒 Itens: ${sale.items.length}`;
    try {
      const botMsg = await chatService.saveMessage({ senderId: SYSTEM_BOT_ID, content: message });
      io.to('chat:general').emit('new_message', { ...botMsg, sender_name: 'Redecell Bot' });
    } catch (e) {
      console.error('Bot sale alert error', e);
    }

    const updates = sale.items.map((item: any) => ({
      variation_id: item.variation_id,
      product_id: item.product_id,
      quantity_sold: item.quantity,
    }));
    io.emit('stock_update', updates);
  });

  appEvents.on('os.status.updated', ({ serviceOrder, oldStatus, newStatus }) => {
    io.emit('os_update', { id: serviceOrder.id, status: newStatus, ...serviceOrder });
    io.emit('kanban_card_moved', {
      serviceOrderId: serviceOrder.id,
      oldStatus,
      newStatus,
      technicianId: serviceOrder.technician_id,
      updatedAt: new Date(),
    });
  });

  appEvents.on('gamification.xp.earned', ({ userId, totalXP, achievements }) => {
    io.emit('xp_earned', { userId, totalXP, achievements });
  });

  appEvents.on('gamification.level.up', ({ userId, oldLevel, newLevel }) => {
    io.emit('level_up', { userId, oldLevel, newLevel });
  });

  appEvents.on('pix.payment.confirmed', ({ transactionId }) => {
    io.emit('pix_paid', { transactionId });
  });
};
