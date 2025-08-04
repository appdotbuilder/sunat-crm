
import { db } from '../db';
import { appointmentsTable } from '../db/schema';
import { type GetAppointmentByIdInput, type Appointment } from '../schema';
import { eq } from 'drizzle-orm';

export const getAppointmentById = async (input: GetAppointmentByIdInput): Promise<Appointment | null> => {
  try {
    const result = await db.select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, input.id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    const appointment = result[0];
    return {
      ...appointment
    };
  } catch (error) {
    console.error('Failed to get appointment by ID:', error);
    throw error;
  }
};
