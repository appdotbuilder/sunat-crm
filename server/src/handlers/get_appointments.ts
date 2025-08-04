
import { db } from '../db';
import { appointmentsTable } from '../db/schema';
import { type Appointment } from '../schema';
import { desc } from 'drizzle-orm';

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const results = await db.select()
      .from(appointmentsTable)
      .orderBy(desc(appointmentsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    throw error;
  }
};
