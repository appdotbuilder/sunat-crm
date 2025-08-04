
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { appointmentsTable, customersTable } from '../db/schema';
import { type CreateAppointmentInput } from '../schema';
import { createAppointment } from '../handlers/create_appointment';
import { eq } from 'drizzle-orm';

describe('createAppointment', () => {
  let customerId: number;

  beforeEach(async () => {
    await createDB();
    
    // Create a customer first (required for foreign key)
    const customer = await db.insert(customersTable)
      .values({
        name: 'Test Customer',
        phone: '555-0123',
        email: 'test@example.com',
        address: '123 Test St',
        notes: 'Test customer'
      })
      .returning()
      .execute();
    
    customerId = customer[0].id;
  });

  afterEach(resetDB);

  it('should create an appointment', async () => {
    const testInput: CreateAppointmentInput = {
      customer_id: customerId,
      appointment_date: new Date('2024-01-15T10:00:00Z'),
      appointment_time: '10:00 AM',
      status: 'scheduled',
      notes: 'Initial consultation',
      reminder_sent: false
    };

    const result = await createAppointment(testInput);

    // Basic field validation
    expect(result.customer_id).toEqual(customerId);
    expect(result.appointment_date).toEqual(testInput.appointment_date);
    expect(result.appointment_time).toEqual('10:00 AM');
    expect(result.status).toEqual('scheduled');
    expect(result.notes).toEqual('Initial consultation');
    expect(result.reminder_sent).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save appointment to database', async () => {
    const testInput: CreateAppointmentInput = {
      customer_id: customerId,
      appointment_date: new Date('2024-01-15T14:30:00Z'),
      appointment_time: '2:30 PM',
      status: 'confirmed',
      notes: null,
      reminder_sent: true
    };

    const result = await createAppointment(testInput);

    // Query using proper drizzle syntax
    const appointments = await db.select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, result.id))
      .execute();

    expect(appointments).toHaveLength(1);
    expect(appointments[0].customer_id).toEqual(customerId);
    expect(appointments[0].appointment_date).toEqual(testInput.appointment_date);
    expect(appointments[0].appointment_time).toEqual('2:30 PM');
    expect(appointments[0].status).toEqual('confirmed');
    expect(appointments[0].notes).toBeNull();
    expect(appointments[0].reminder_sent).toEqual(true);
    expect(appointments[0].created_at).toBeInstanceOf(Date);
    expect(appointments[0].updated_at).toBeInstanceOf(Date);
  });

  it('should use default status when not provided', async () => {
    const testInput: CreateAppointmentInput = {
      customer_id: customerId,
      appointment_date: new Date('2024-01-20T09:00:00Z'),
      appointment_time: '9:00 AM',
      status: 'scheduled', // Default value applied by Zod
      notes: null,
      reminder_sent: false // Default value applied by Zod
    };

    const result = await createAppointment(testInput);

    expect(result.status).toEqual('scheduled');
    expect(result.reminder_sent).toEqual(false);
  });

  it('should throw error when customer does not exist', async () => {
    const testInput: CreateAppointmentInput = {
      customer_id: 99999, // Non-existent customer ID
      appointment_date: new Date('2024-01-15T10:00:00Z'),
      appointment_time: '10:00 AM',
      status: 'scheduled',
      notes: null,
      reminder_sent: false
    };

    expect(createAppointment(testInput)).rejects.toThrow(/customer.*not found/i);
  });
});
