
import { serial, text, pgTable, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define the category enum for PostgreSQL
export const ideaCategoryEnum = pgEnum('idea_category', ['Work Related', 'Hobby', 'To Do']);

export const ideasTable = pgTable('ideas', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: ideaCategoryEnum('category').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type Idea = typeof ideasTable.$inferSelect; // For SELECT operations
export type NewIdea = typeof ideasTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { ideas: ideasTable };
