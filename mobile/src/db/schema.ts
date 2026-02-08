import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'service_orders',
      columns: [
        { name: 'customer_name', type: 'string' },
        { name: 'device', type: 'string' },
        { name: 'issue_description', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'sync_changes',
      columns: [
        { name: 'change_type', type: 'string' }, // create, update, delete
        { name: 'record_id', type: 'string' },
        { name: 'table_name', type: 'string' },
        { name: 'data', type: 'string' }, // JSON stringified
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
