// frontend/src/db.ts
import Dexie, { Table } from 'dexie';

export interface OfflineRequest {
  id?: number;
  url: string;
  method: string;
  headers?: any;
  body?: any;
  timestamp: number;
  synced: number; // 0 for false, 1 for true
}

export class AppDB extends Dexie {
  offlineSales!: Table<OfflineRequest>;
  offlineServiceOrders!: Table<OfflineRequest>;

  constructor() {
    super('RedecellPWA');
    this.version(3).stores({ // Incremented version for schema change
      offlineSales: '++id, timestamp, synced',
      offlineServiceOrders: '++id, timestamp, synced',
    });
  }
}

export const db = new AppDB();