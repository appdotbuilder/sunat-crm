
import { db } from '../db';
import { appointmentsTable } from '../db/schema';
import { type GetAppointmentsByCustomerInput, type Appointment } from '../schema';
import { eq } from 'drizzle-orm';

export const getAppointmentsByCustomer = async (input: GetAppointmentsByCustomerInput): Promise<Appointment[]> => {
  try {
    const results = await db.select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.customer_id, input.customer_id))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch appointments by customer:', error);
    throw error;
  }
};
