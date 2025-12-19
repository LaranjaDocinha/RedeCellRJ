import { db, OfflineRequest } from '../db';
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast usage or replace with alert/console

export const offlineSyncService = {
  // Adiciona uma requisição à fila offline
  async queueRequest(url: string, method: string, body: any, headers: any = {}) {
    try {
      await db.offlineServiceOrders.add({
        url,
        method,
        body,
        headers,
        timestamp: Date.now(),
        synced: 0,
      });
      // toast.success('Salvo offline! Será enviado quando houver conexão.');
      console.log('Request queued offline:', url);
    } catch (error) {
      console.error('Error queueing offline request:', error);
      // toast.error('Erro ao salvar offline.');
    }
  },

  // Sincroniza as requisições pendentes
  async sync() {
    if (!navigator.onLine) return;

    const pendingRequests = await db.offlineServiceOrders.where('synced').equals(0).toArray();

    if (pendingRequests.length === 0) return;

    // toast.loading(`Sincronizando ${pendingRequests.length} itens...`);
    console.log(`Syncing ${pendingRequests.length} items...`);

    for (const req of pendingRequests) {
      try {
        await axios({
          method: req.method,
          url: req.url, // Ensure this URL is complete or relative to baseURL handled by axios config
          data: req.body,
          headers: req.headers,
        });

        // Mark as synced or delete
        await db.offlineServiceOrders.update(req.id!, { synced: 1 });
        await db.offlineServiceOrders.delete(req.id!); // Clean up after success
        
      } catch (error) {
        console.error(`Failed to sync request ${req.id} (${req.url}):`, error);
        // Keep in queue to retry later? Or move to 'failed_requests' table?
        // For now, keep it.
      }
    }
    
    // toast.dismiss();
    // toast.success('Sincronização concluída!');
    console.log('Sync complete');
    window.dispatchEvent(new Event('offline-sync-complete')); // Notify UI
  },

  // Inicializa os listeners
  init() {
    window.addEventListener('online', () => {
      // toast('Conexão restaurada! Sincronizando...', { icon: 'wifi' });
      console.log('Online! Syncing...');
      this.sync();
    });

    window.addEventListener('offline', () => {
      // toast('Você está offline. As alterações serão salvas localmente.', { icon: 'wifi-off' });
      console.log('Offline mode activated.');
    });
    
    // Tenta sincronizar ao iniciar se já estiver online
    if(navigator.onLine) {
        this.sync();
    }
  }
};
