import Dexie, { Table } from 'dexie';
import { Invoice, Client, AuditLog } from './types';

export class AfacturaDB extends Dexie {
  invoices!: Table<Invoice>;
  clients!: Table<Client>;
  logs!: Table<AuditLog>;
  settings!: Table<any>;

  constructor() {
    super('AfacturaDB');
    (this as any).version(2).stores({
      invoices: 'id, series, number, date, clientId, status, type',
      clients: 'id, name, nif',
      logs: '++id, timestamp, action',
      settings: 'key' // Store key-value pairs (key='profile')
    });
  }
}

export const db = new AfacturaDB();