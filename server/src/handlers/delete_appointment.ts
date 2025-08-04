
import { db } from '../db';
import { appointmentsTable } from '../db/schema';
import { type DeleteAppointmentInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteAppointment = async (input: DeleteAppointmentInput): Promise<boolean> => {
  try {
    const result = await db.delete(appointmentsTable)
      .where(eq(appointmentsTable.id, input.id))
      .execute();

    // Return true if a row was deleted, false if no appointment found
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Appointment deletion failed:', error);
    throw error;
  }
};
