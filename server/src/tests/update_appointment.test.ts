
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { customersTable, appointmentsTable } from '../db/schema';
import { type UpdateAppointmentInput, type CreateCustomerInput } from '../schema';
import { updateAppointment } from '../handlers/update_appointment';
import { eq } from 'drizzle-orm';

// Test customer data
const testCustomer: CreateCustomerInput = {
  name: 'John Doe',
  phone: '555-0123',
  email: 'john@example.com',
  address: '123 Main St',
  notes: 'Test customer'
};

describe('updateAppointment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update an appointment', async () => {
    // Create customer first
    const customerResult = await db.insert(customersTable)
      .values(testCustomer)
      .returning()
      .execute();
    const customerId = customerResult[0].id;

    // Create appointment
    const appointmentResult = await db.insert(appointmentsTable)
      .values({
        customer_id: customerId,
        appointment_date: new Date('2024-01-15'),
        appointment_time: '10:00',
        status: 'scheduled',
        notes: 'Initial appointment',
        reminder_sent: false
      })
      .returning()
      .execute();
    const appointmentId = appointmentResult[0].id;

    // Update appointment
    const updateInput: UpdateAppointmentInput = {
      id: appointmentId,
      appointment_date: new Date('2024-01-20'),
      appointment_time: '14:30',
      status: 'confirmed',
      notes: 'Updated appointment notes',
      reminder_sent: true
    };

    const result = await updateAppointment(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(appointmentId);
    expect(result.customer_id).toEqual(customerId);
    expect(result.appointment_date).toEqual(new Date('2024-01-20'));
    expect(result.appointment_time).toEqual('14:30');
    expect(result.status).toEqual('confirmed');
    expect(result.notes).toEqual('Updated appointment notes');
    expect(result.reminder_sent).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update appointment in database', async () => {
    // Create customer first
    const customerResult = await db.insert(customersTable)
      .values(testCustomer)
      .returning()
      .execute();
    const customerId = customerResult[0].id;

    // Create appointment
    const appointmentResult = await db.insert(appointmentsTable)
      .values({
        customer_id: customerId,
        appointment_date: new Date('2024-01-15'),
        appointment_time: '10:00',
        status: 'scheduled',
        notes: 'Initial appointment',
        reminder_sent: false
      })
      .returning()
      .execute();
    const appointmentId = appointmentResult[0].id;

    // Update appointment
    const updateInput: UpdateAppointmentInput = {
      id: appointmentId,
      status: 'completed',
      reminder_sent: true
    };

    await updateAppointment(updateInput);

    // Verify in database
    const appointments = await db.select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, appointmentId))
      .execute();

    expect(appointments).toHaveLength(1);
    expect(appointments[0].status).toEqual('completed');
    expect(appointments[0].reminder_sent).toEqual(true);
    expect(appointments[0].appointment_date).toEqual(new Date('2024-01-15'));
    expect(appointments[0].appointment_time).toEqual('10:00');
    expect(appointments[0].notes).toEqual('Initial appointment');
  });

  it('should update only provided fields', async () => {
    // Create customer first
    const customerResult = await db.insert(customersTable)
      .values(testCustomer)
      .returning()
      .execute();
    const customerId = customerResult[0].id;

    // Create appointment
    const appointmentResult = await db.insert(appointmentsTable)
      .values({
        customer_id: customerId,
        appointment_date: new Date('2024-01-15'),
        appointment_time: '10:00',
        status: 'scheduled',
        notes: 'Original notes',
        reminder_sent: false
      })
      .returning()
      .execute();
    const appointmentId = appointmentResult[0].id;

    // Update only status
    const updateInput: UpdateAppointmentInput = {
      id: appointmentId,
      status: 'confirmed'
    };

    const result = await updateAppointment(updateInput);

    // Verify only status changed
    expect(result.status).toEqual('confirmed');
    expect(result.appointment_date).toEqual(new Date('2024-01-15'));
    expect(result.appointment_time).toEqual('10:00');
    expect(result.notes).toEqual('Original notes');
    expect(result.reminder_sent).toEqual(false);
  });

  it('should throw error for non-existent appointment', async () => {
    const updateInput: UpdateAppointmentInput = {
      id: 999,
      status: 'confirmed'
    };

    expect(updateAppointment(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle nullable fields correctly', async () => {
    // Create customer first
    const customerResult = await db.insert(customersTable)
      .values(testCustomer)
      .returning()
      .execute();
    const customerId = customerResult[0].id;

    // Create appointment
    const appointmentResult = await db.insert(appointmentsTable)
      .values({
        customer_id: customerId,
        appointment_date: new Date('2024-01-15'),
        appointment_time: '10:00',
        status: 'scheduled',
        notes: 'Original notes',
        reminder_sent: false
      })
      .returning()
      .execute();
    const appointmentId = appointmentResult[0].id;

    // Update notes to null
    const updateInput: UpdateAppointmentInput = {
      id: appointmentId,
      notes: null
    };

    const result = await updateAppointment(updateInput);

    expect(result.notes).toBeNull();
  });
});
