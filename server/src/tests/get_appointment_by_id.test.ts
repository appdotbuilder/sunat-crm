
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { customersTable, appointmentsTable } from '../db/schema';
import { type GetAppointmentByIdInput, type CreateCustomerInput } from '../schema';
import { getAppointmentById } from '../handlers/get_appointment_by_id';

// Test customer data
const testCustomer: CreateCustomerInput = {
  name: 'John Doe',
  phone: '555-0123',
  email: 'john@example.com',
  address: '123 Main St',
  notes: 'Test customer'
};

describe('getAppointmentById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return appointment when found', async () => {
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
        notes: 'Test appointment',
        reminder_sent: false
      })
      .returning()
      .execute();

    const appointmentId = appointmentResult[0].id;

    // Test the handler
    const input: GetAppointmentByIdInput = { id: appointmentId };
    const result = await getAppointmentById(input);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(appointmentId);
    expect(result!.customer_id).toEqual(customerId);
    expect(result!.appointment_date).toBeInstanceOf(Date);
    expect(result!.appointment_time).toEqual('10:00');
    expect(result!.status).toEqual('scheduled');
    expect(result!.notes).toEqual('Test appointment');
    expect(result!.reminder_sent).toEqual(false);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when appointment not found', async () => {
    const input: GetAppointmentByIdInput = { id: 999 };
    const result = await getAppointmentById(input);

    expect(result).toBeNull();
  });

  it('should handle different appointment statuses', async () => {
    // Create customer first
    const customerResult = await db.insert(customersTable)
      .values(testCustomer)
      .returning()
      .execute();
    
    const customerId = customerResult[0].id;

    // Create appointment with different status
    const appointmentResult = await db.insert(appointmentsTable)
      .values({
        customer_id: customerId,
        appointment_date: new Date('2024-01-16'),
        appointment_time: '14:30',
        status: 'confirmed',
        notes: null,
        reminder_sent: true
      })
      .returning()
      .execute();

    const appointmentId = appointmentResult[0].id;

    // Test the handler
    const input: GetAppointmentByIdInput = { id: appointmentId };
    const result = await getAppointmentById(input);

    expect(result).toBeDefined();
    expect(result!.status).toEqual('confirmed');
    expect(result!.notes).toBeNull();
    expect(result!.reminder_sent).toEqual(true);
  });
});
