import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const urlsTable = pgTable('urls', {
	id: serial('id').primaryKey(),
	originalUrl: text('original_url').notNull(),
	shortCode: varchar('short_code', { length: 10 }).notNull().unique(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
