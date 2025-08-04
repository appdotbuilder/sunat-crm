
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { customersTable, appointmentsTable } from '../db/schema';
import { getAppointments } from '../handlers/get_appointments';

describe('getAppointments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no appointments exist', async () => {
    const result = await getAppointments();
    expect(result).toEqual([]);
  });

  it('should return all appointments', async () => {
    // Create test customer first
    const customerResult = await db.insert(customersTable)
      .values({
        name: 'Test Customer',
        phone: '123-456-7890'
      })
      .returning()
      .execute();

    const customerId = customerResult[0].id;

    // Create test appointments
    const firstAppointment = await db.insert(appointmentsTable)
      .values({
        customer_id: customerId,
        appointment_date: new Date('2024-01-15'),
        appointment_time: '10:00',
        status: 'scheduled',
        notes: 'First appointment',
        reminder_sent: false
      })
      .returning()
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondAppointment = await db.insert(appointmentsTable)
      .values({
        customer_id: customerId,
        appointment_date: new Date('2024-01-16'),
        appointment_time: '14:30',
        status: 'confirmed',
        notes: 'Second appointment',
        reminder_sent: true
      })
      .returning()
      .execute();

    const result = await getAppointments();

    expect(result).toHaveLength(2);
    
    // Results are ordered by created_at descending, so second appointment comes first
    expect(result[0].id).toEqual(secondAppointment[0].id);
    expect(result[0].customer_id).toEqual(customerId);
    expect(result[0].appointment_date).toBeInstanceOf(Date);
    expect(result[0].appointment_time).toEqual('14:30');
    expect(result[0].status).toEqual('confirmed');
    expect(result[0].notes).toEqual('Second appointment');
    expect(result[0].reminder_sent).toEqual(true);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    expect(result[1].id).toEqual(firstAppointment[0].id);
    expect(result[1].customer_id).toEqual(customerId);
    expect(result[1].appointment_date).toBeInstanceOf(Date);
    expect(result[1].appointment_time).toEqual('10:00');
    expect(result[1].status).toEqual('scheduled');
    expect(result[1].notes).toEqual('First appointment');
    expect(result[1].reminder_sent).toEqual(false);
  });

  it('should return appointments ordered by created_at descending', async () => {
    // Create test customer
    const customerResult = await db.insert(customersTable)
      .values({
        name: 'Test Customer',
        phone: '123-456-7890'
      })
      .returning()
      .execute();

    const customerId = customerResult[0].id;

    // Create appointments with slight delay to ensure different created_at times
    const firstAppointment = await db.insert(appointmentsTable)
      .values({
        customer_id: customerId,
        appointment_date: new Date('2024-01-15'),
        appointment_time: '10:00',
        status: 'scheduled'
      })
      .returning()
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondAppointment = await db.insert(appointmentsTable)
      .values({
        customer_id: customerId,
        appointment_date: new Date('2024-01-16'),
        appointment_time: '14:30',
        status: 'confirmed'
      })
      .returning()
      .execute();

    const result = await getAppointments();

    expect(result).toHaveLength(2);
    // Most recently created should be first (descending order)
    expect(result[0].id).toEqual(secondAppointment[0].id);
    expect(result[1].id).toEqual(firstAppointment[0].id);
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });
});
