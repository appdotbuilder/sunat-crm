
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createCustomerInputSchema,
  updateCustomerInputSchema,
  getCustomerByIdInputSchema,
  deleteCustomerInputSchema,
  createFaqInputSchema,
  updateFaqInputSchema,
  getFaqByIdInputSchema,
  deleteFaqInputSchema,
  createMessageTemplateInputSchema,
  updateMessageTemplateInputSchema,
  getMessageTemplateByIdInputSchema,
  deleteMessageTemplateInputSchema,
  createAppointmentInputSchema,
  updateAppointmentInputSchema,
  getAppointmentByIdInputSchema,
  getAppointmentsByCustomerInputSchema,
  deleteAppointmentInputSchema
} from './schema';

// Import handlers
import { createCustomer } from './handlers/create_customer';
import { getCustomers } from './handlers/get_customers';
import { getCustomerById } from './handlers/get_customer_by_id';
import { updateCustomer } from './handlers/update_customer';
import { deleteCustomer } from './handlers/delete_customer';

import { createFaq } from './handlers/create_faq';
import { getFaqs } from './handlers/get_faqs';
import { getFaqById } from './handlers/get_faq_by_id';
import { updateFaq } from './handlers/update_faq';
import { deleteFaq } from './handlers/delete_faq';

import { createMessageTemplate } from './handlers/create_message_template';
import { getMessageTemplates } from './handlers/get_message_templates';
import { getMessageTemplateById } from './handlers/get_message_template_by_id';
import { updateMessageTemplate } from './handlers/update_message_template';
import { deleteMessageTemplate } from './handlers/delete_message_template';

import { createAppointment } from './handlers/create_appointment';
import { getAppointments } from './handlers/get_appointments';
import { getAppointmentById } from './handlers/get_appointment_by_id';
import { getAppointmentsByCustomer } from './handlers/get_appointments_by_customer';
import { updateAppointment } from './handlers/update_appointment';
import { deleteAppointment } from './handlers/delete_appointment';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Customer routes
  createCustomer: publicProcedure
    .input(createCustomerInputSchema)
    .mutation(({ input }) => createCustomer(input)),
  
  getCustomers: publicProcedure
    .query(() => getCustomers()),
  
  getCustomerById: publicProcedure
    .input(getCustomerByIdInputSchema)
    .query(({ input }) => getCustomerById(input)),
  
  updateCustomer: publicProcedure
    .input(updateCustomerInputSchema)
    .mutation(({ input }) => updateCustomer(input)),
  
  deleteCustomer: publicProcedure
    .input(deleteCustomerInputSchema)
    .mutation(({ input }) => deleteCustomer(input)),

  // FAQ routes
  createFaq: publicProcedure
    .input(createFaqInputSchema)
    .mutation(({ input }) => createFaq(input)),
  
  getFaqs: publicProcedure
    .query(() => getFaqs()),
  
  getFaqById: publicProcedure
    .input(getFaqByIdInputSchema)
    .query(({ input }) => getFaqById(input)),
  
  updateFaq: publicProcedure
    .input(updateFaqInputSchema)
    .mutation(({ input }) => updateFaq(input)),
  
  deleteFaq: publicProcedure
    .input(deleteFaqInputSchema)
    .mutation(({ input }) => deleteFaq(input)),

  // Message template routes
  createMessageTemplate: publicProcedure
    .input(createMessageTemplateInputSchema)
    .mutation(({ input }) => createMessageTemplate(input)),
  
  getMessageTemplates: publicProcedure
    .query(() => getMessageTemplates()),
  
  getMessageTemplateById: publicProcedure
    .input(getMessageTemplateByIdInputSchema)
    .query(({ input }) => getMessageTemplateById(input)),
  
  updateMessageTemplate: publicProcedure
    .input(updateMessageTemplateInputSchema)
    .mutation(({ input }) => updateMessageTemplate(input)),
  
  deleteMessageTemplate: publicProcedure
    .input(deleteMessageTemplateInputSchema)
    .mutation(({ input }) => deleteMessageTemplate(input)),

  // Appointment routes
  createAppointment: publicProcedure
    .input(createAppointmentInputSchema)
    .mutation(({ input }) => createAppointment(input)),
  
  getAppointments: publicProcedure
    .query(() => getAppointments()),
  
  getAppointmentById: publicProcedure
    .input(getAppointmentByIdInputSchema)
    .query(({ input }) => getAppointmentById(input)),
  
  getAppointmentsByCustomer: publicProcedure
    .input(getAppointmentsByCustomerInputSchema)
    .query(({ input }) => getAppointmentsByCustomer(input)),
  
  updateAppointment: publicProcedure
    .input(updateAppointmentInputSchema)
    .mutation(({ input }) => updateAppointment(input)),
  
  deleteAppointment: publicProcedure
    .input(deleteAppointmentInputSchema)
    .mutation(({ input }) => deleteAppointment(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
