
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { customersTable, appointmentsTable } from '../db/schema';
import { type DeleteAppointmentInput, type CreateCustomerInput } from '../schema';
import { deleteAppointment } from '../handlers/delete_appointment';
import { eq } from 'drizzle-orm';

describe('deleteAppointment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing appointment', async () => {
    // Create test customer first
    const customerInput: CreateCustomerInput = {
      name: 'Test Customer',
      phone: '123-456-7890',
      email: 'test@example.com',
      address: '123 Test St',
      notes: 'Test customer notes'
    };

    const customerResult = await db.insert(customersTable)
      .values(customerInput)
      .returning()
      .execute();

    const customer = customerResult[0];

    // Create test appointment
    const appointmentResult = await db.insert(appointmentsTable)
      .values({
        customer_id: customer.id,
        appointment_date: new Date('2024-01-01'),
        appointment_time: '10:00 AM',
        status: 'scheduled',
        notes: 'Test appointment',
        reminder_sent: false
      })
      .returning()
      .execute();

    const appointment = appointmentResult[0];

    const input: DeleteAppointmentInput = {
      id: appointment.id
    };

    // Delete the appointment
    const result = await deleteAppointment(input);

    expect(result).toBe(true);

    // Verify appointment was deleted from database
    const appointments = await db.select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, appointment.id))
      .execute();

    expect(appointments).toHaveLength(0);
  });

  it('should return false when appointment does not exist', async () => {
    const input: DeleteAppointmentInput = {
      id: 999999 // Non-existent ID
    };

    const result = await deleteAppointment(input);

    expect(result).toBe(false);
  });

  it('should not affect other appointments when deleting one', async () => {
    // Create test customer
    const customerInput: CreateCustomerInput = {
      name: 'Test Customer',
      phone: '123-456-7890',
      email: 'test@example.com',
      address: '123 Test St',
      notes: 'Test customer notes'
    };

    const customerResult = await db.insert(customersTable)
      .values(customerInput)
      .returning()
      .execute();

    const customer = customerResult[0];

    // Create two test appointments
    const appointment1Result = await db.insert(appointmentsTable)
      .values({
        customer_id: customer.id,
        appointment_date: new Date('2024-01-01'),
        appointment_time: '10:00 AM',
        status: 'scheduled',
        notes: 'First appointment',
        reminder_sent: false
      })
      .returning()
      .execute();

    const appointment2Result = await db.insert(appointmentsTable)
      .values({
        customer_id: customer.id,
        appointment_date: new Date('2024-01-02'),
        appointment_time: '2:00 PM',
        status: 'confirmed',
        notes: 'Second appointment',
        reminder_sent: true
      })
      .returning()
      .execute();

    const appointment1 = appointment1Result[0];
    const appointment2 = appointment2Result[0];

    // Delete first appointment
    const input: DeleteAppointmentInput = {
      id: appointment1.id
    };

    const result = await deleteAppointment(input);

    expect(result).toBe(true);

    // Verify first appointment was deleted
    const deletedAppointments = await db.select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, appointment1.id))
      .execute();

    expect(deletedAppointments).toHaveLength(0);

    // Verify second appointment still exists
    const remainingAppointments = await db.select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, appointment2.id))
      .execute();

    expect(remainingAppointments).toHaveLength(1);
    expect(remainingAppointments[0].notes).toEqual('Second appointment');
    expect(remainingAppointments[0].status).toEqual('confirmed');
  });
});
