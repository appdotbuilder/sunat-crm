
import { db } from '../db';
import { appointmentsTable } from '../db/schema';
import { type UpdateAppointmentInput, type Appointment } from '../schema';
import { eq } from 'drizzle-orm';

export const updateAppointment = async (input: UpdateAppointmentInput): Promise<Appointment> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.customer_id !== undefined) {
      updateData.customer_id = input.customer_id;
    }
    if (input.appointment_date !== undefined) {
      updateData.appointment_date = input.appointment_date;
    }
    if (input.appointment_time !== undefined) {
      updateData.appointment_time = input.appointment_time;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }
    if (input.reminder_sent !== undefined) {
      updateData.reminder_sent = input.reminder_sent;
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Update appointment record
    const result = await db.update(appointmentsTable)
      .set(updateData)
      .where(eq(appointmentsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Appointment with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Appointment update failed:', error);
    throw error;
  }
};
