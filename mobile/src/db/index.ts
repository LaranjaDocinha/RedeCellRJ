import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { mySchema } from './schema';
import ServiceOrder from './model/ServiceOrder';

const adapter = new SQLiteAdapter({
  schema: mySchema,
  // (You might want to comment out migrations if you haven't created them yet)
  // migrations,
  jsi: true, // Recommended for better performance
  onSetUpError: error => {
    // Database failed to load -- likely corrupt or schema mismatch
    // In production, you might want to wipe the database and start fresh
    console.error('Database setup failed', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    ServiceOrder,
  ],
});
