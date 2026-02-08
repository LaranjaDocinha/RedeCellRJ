import Dexie, { Table } from 'dexie';

export interface LocalProduct {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  category: string;
}

export interface OfflineSale {
  id?: number;
  items: any[];
  total: number;
  paymentMethod: string;
  customerId?: string;
  timestamp: Date;
  synced: boolean;
}

export class RedecellLocalDB extends Dexie {
  products!: Table<LocalProduct>;
  offlineSales!: Table<OfflineSale>;

  constructor() {
    super('RedecellLocalDB');
    this.version(1).stores({
      products: 'id, name, sku, category',
      offlineSales: '++id, synced, timestamp'
    });
  }
}

export const db = new RedecellLocalDB();
