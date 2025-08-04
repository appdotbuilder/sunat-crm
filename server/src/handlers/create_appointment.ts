
import { db } from '../db';
import { appointmentsTable, customersTable } from '../db/schema';
import { type CreateAppointmentInput, type Appointment } from '../schema';
import { eq } from 'drizzle-orm';

export const createAppointment = async (input: CreateAppointmentInput): Promise<Appointment> => {
  try {
    // Verify customer exists to prevent foreign key constraint violation
    const customer = await db.select()
      .from(customersTable)
      .where(eq(customersTable.id, input.customer_id))
      .execute();

    if (customer.length === 0) {
      throw new Error(`Customer with id ${input.customer_id} not found`);
    }

    // Insert appointment record
    const result = await db.insert(appointmentsTable)
      .values({
        customer_id: input.customer_id,
        appointment_date: input.appointment_date,
        appointment_time: input.appointment_time,
        status: input.status,
        notes: input.notes,
        reminder_sent: input.reminder_sent
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Appointment creation failed:', error);
    throw error;
  }
};
