
import { z } from 'zod';

// Customer schema
export const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Customer = z.infer<typeof customerSchema>;

// Input schema for creating customers
export const createCustomerInputSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().nullable(),
  address: z.string().nullable(),
  notes: z.string().nullable()
});

export type CreateCustomerInput = z.infer<typeof createCustomerInputSchema>;

// Input schema for updating customers
export const updateCustomerInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
});

export type UpdateCustomerInput = z.infer<typeof updateCustomerInputSchema>;

// FAQ schema
export const faqSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
  category: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type FAQ = z.infer<typeof faqSchema>;

// Input schema for creating FAQs
export const createFaqInputSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().nullable(),
  is_active: z.boolean().default(true)
});

export type CreateFaqInput = z.infer<typeof createFaqInputSchema>;

// Input schema for updating FAQs
export const updateFaqInputSchema = z.object({
  id: z.number(),
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  category: z.string().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateFaqInput = z.infer<typeof updateFaqInputSchema>;

// Message template schema
export const messageTemplateSchema = z.object({
  id: z.number(),
  name: z.string(),
  content: z.string(),
  template_type: z.enum(['confirmation', 'reminder', 'follow_up', 'general']),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type MessageTemplate = z.infer<typeof messageTemplateSchema>;

// Input schema for creating message templates
export const createMessageTemplateInputSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  template_type: z.enum(['confirmation', 'reminder', 'follow_up', 'general']),
  is_active: z.boolean().default(true)
});

export type CreateMessageTemplateInput = z.infer<typeof createMessageTemplateInputSchema>;

// Input schema for updating message templates
export const updateMessageTemplateInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  template_type: z.enum(['confirmation', 'reminder', 'follow_up', 'general']).optional(),
  is_active: z.boolean().optional()
});

export type UpdateMessageTemplateInput = z.infer<typeof updateMessageTemplateInputSchema>;

// Appointment schema
export const appointmentSchema = z.object({
  id: z.number(),
  customer_id: z.number(),
  appointment_date: z.coerce.date(),
  appointment_time: z.string(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled']),
  notes: z.string().nullable(),
  reminder_sent: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Appointment = z.infer<typeof appointmentSchema>;

// Input schema for creating appointments
export const createAppointmentInputSchema = z.object({
  customer_id: z.number(),
  appointment_date: z.coerce.date(),
  appointment_time: z.string(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled']).default('scheduled'),
  notes: z.string().nullable(),
  reminder_sent: z.boolean().default(false)
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentInputSchema>;

// Input schema for updating appointments
export const updateAppointmentInputSchema = z.object({
  id: z.number(),
  customer_id: z.number().optional(),
  appointment_date: z.coerce.date().optional(),
  appointment_time: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled']).optional(),
  notes: z.string().nullable().optional(),
  reminder_sent: z.boolean().optional()
});

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentInputSchema>;

// Query input schemas
export const getCustomerByIdInputSchema = z.object({
  id: z.number()
});

export type GetCustomerByIdInput = z.infer<typeof getCustomerByIdInputSchema>;

export const getFaqByIdInputSchema = z.object({
  id: z.number()
});

export type GetFaqByIdInput = z.infer<typeof getFaqByIdInputSchema>;

export const getMessageTemplateByIdInputSchema = z.object({
  id: z.number()
});

export type GetMessageTemplateByIdInput = z.infer<typeof getMessageTemplateByIdInputSchema>;

export const getAppointmentByIdInputSchema = z.object({
  id: z.number()
});

export type GetAppointmentByIdInput = z.infer<typeof getAppointmentByIdInputSchema>;

export const getAppointmentsByCustomerInputSchema = z.object({
  customer_id: z.number()
});

export type GetAppointmentsByCustomerInput = z.infer<typeof getAppointmentsByCustomerInputSchema>;

export const deleteCustomerInputSchema = z.object({
  id: z.number()
});

export type DeleteCustomerInput = z.infer<typeof deleteCustomerInputSchema>;

export const deleteFaqInputSchema = z.object({
  id: z.number()
});

export type DeleteFaqInput = z.infer<typeof deleteFaqInputSchema>;

export const deleteMessageTemplateInputSchema = z.object({
  id: z.number()
});

export type DeleteMessageTemplateInput = z.infer<typeof deleteMessageTemplateInputSchema>;

export const deleteAppointmentInputSchema = z.object({
  id: z.number()
});

export type DeleteAppointmentInput = z.infer<typeof deleteAppointmentInputSchema>;
