
import { serial, text, pgTable, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum for message template types
export const templateTypeEnum = pgEnum('template_type', ['confirmation', 'reminder', 'follow_up', 'general']);

// Enum for appointment status
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled']);

// Customers table
export const customersTable = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'), // Nullable by default
  address: text('address'), // Nullable by default
  notes: text('notes'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// FAQs table
export const faqsTable = pgTable('faqs', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category'), // Nullable by default
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Message templates table
export const messageTemplatesTable = pgTable('message_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  template_type: templateTypeEnum('template_type').notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Appointments table
export const appointmentsTable = pgTable('appointments', {
  id: serial('id').primaryKey(),
  customer_id: serial('customer_id').notNull().references(() => customersTable.id),
  appointment_date: timestamp('appointment_date').notNull(),
  appointment_time: text('appointment_time').notNull(),
  status: appointmentStatusEnum('status').default('scheduled').notNull(),
  notes: text('notes'), // Nullable by default
  reminder_sent: boolean('reminder_sent').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const customersRelations = relations(customersTable, ({ many }) => ({
  appointments: many(appointmentsTable),
}));

export const appointmentsRelations = relations(appointmentsTable, ({ one }) => ({
  customer: one(customersTable, {
    fields: [appointmentsTable.customer_id],
    references: [customersTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Customer = typeof customersTable.$inferSelect;
export type NewCustomer = typeof customersTable.$inferInsert;

export type FAQ = typeof faqsTable.$inferSelect;
export type NewFAQ = typeof faqsTable.$inferInsert;

export type MessageTemplate = typeof messageTemplatesTable.$inferSelect;
export type NewMessageTemplate = typeof messageTemplatesTable.$inferInsert;

export type Appointment = typeof appointmentsTable.$inferSelect;
export type NewAppointment = typeof appointmentsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  customers: customersTable,
  faqs: faqsTable,
  messageTemplates: messageTemplatesTable,
  appointments: appointmentsTable
};
