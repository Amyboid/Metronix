import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const demoUsers = pgTable('demo_user', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().default('Anonymous'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});