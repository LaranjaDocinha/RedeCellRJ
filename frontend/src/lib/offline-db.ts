import Dexie, { Table } from 'dexie';

export interface SalePayload {
  id?: number;
  customer_id: number;
  items: any[];
  total_amount: number;
  // ... other sale fields
}

export class OfflineDB extends Dexie {
  pendingSales!: Table<SalePayload>; 

  constructor() {
    super('RedecellOfflineDB');
    this.version(1).stores({
      pendingSales: '++id' // Auto-incrementing primary key
    });
  }
}

export const db = new OfflineDB();

// Service to sync pending sales to the backend when online
export const syncPendingSales = async () => {
  const salesToSync = await db.pendingSales.toArray();
  for (const sale of salesToSync) {
    try {
      // const response = await fetch('/api/sales', { method: 'POST', body: JSON.stringify(sale) ... });
      // if (response.ok) {
      //   await db.pendingSales.delete(sale.id!);
      // }
      console.log(`(Simulated) Syncing sale ${sale.id}`);
      await db.pendingSales.delete(sale.id!);
    } catch (error) {
      console.error('Failed to sync sale:', error);
    }
  }
};
