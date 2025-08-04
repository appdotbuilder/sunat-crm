
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { customersTable, appointmentsTable } from '../db/schema';
import { type GetAppointmentsByCustomerInput } from '../schema';
import { getAppointmentsByCustomer } from '../handlers/get_appointments_by_customer';

describe('getAppointmentsByCustomer', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when customer has no appointments', async () => {
    // Create customer directly in database
    const customerResult = await db.insert(customersTable)
      .values({
        name: 'John Doe',
        phone: '555-1234',
        email: 'john@example.com',
        address: '123 Main St',
        notes: 'Test customer'
      })
      .returning()
      .execute();

    const customer = customerResult[0];

    const input: GetAppointmentsByCustomerInput = {
      customer_id: customer.id
    };

    const result = await getAppointmentsByCustomer(input);

    expect(result).toEqual([]);
  });

  it('should return appointments for specific customer', async () => {
    // Create customer directly in database
    const customerResult = await db.insert(customersTable)
      .values({
        name: 'John Doe',
        phone: '555-1234',
        email: 'john@example.com',
        address: '123 Main St',
        notes: 'Test customer'
      })
      .returning()
      .execute();

    const customer = customerResult[0];

    // Create appointment directly in database
    const appointmentResult = await db.insert(appointmentsTable)
      .values({
        customer_id: customer.id,
        appointment_date: new Date('2024-12-25'),
        appointment_time: '10:00',
        status: 'scheduled',
        notes: 'Test appointment',
        reminder_sent: false
      })
      .returning()
      .execute();

    const appointment = appointmentResult[0];

    const input: GetAppointmentsByCustomerInput = {
      customer_id: customer.id
    };

    const result = await getAppointmentsByCustomer(input);

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(appointment.id);
    expect(result[0].customer_id).toEqual(customer.id);
    expect(result[0].appointment_date).toBeInstanceOf(Date);
    expect(result[0].appointment_time).toEqual('10:00');
    expect(result[0].status).toEqual('scheduled');
    expect(result[0].notes).toEqual('Test appointment');
    expect(result[0].reminder_sent).toEqual(false);
  });

  it('should return multiple appointments for customer', async () => {
    // Create customer directly in database
    const customerResult = await db.insert(customersTable)
      .values({
        name: 'John Doe',
        phone: '555-1234',
        email: 'john@example.com',
        address: '123 Main St',
        notes: 'Test customer'
      })
      .returning()
      .execute();

    const customer = customerResult[0];

    // Create multiple appointments directly in database
    await db.insert(appointmentsTable)
      .values([
        {
          customer_id: customer.id,
          appointment_date: new Date('2024-12-25'),
          appointment_time: '10:00',
          status: 'scheduled',
          notes: 'First appointment',
          reminder_sent: false
        },
        {
          customer_id: customer.id,
          appointment_date: new Date('2024-12-26'),
          appointment_time: '14:00',
          status: 'scheduled',
          notes: 'Second appointment',
          reminder_sent: false
        }
      ])
      .execute();

    const input: GetAppointmentsByCustomerInput = {
      customer_id: customer.id
    };

    const result = await getAppointmentsByCustomer(input);

    expect(result).toHaveLength(2);
    expect(result.every(apt => apt.customer_id === customer.id)).toBe(true);
    
    // Verify different appointment details
    const notes = result.map(apt => apt.notes);
    expect(notes).toContain('First appointment');
    expect(notes).toContain('Second appointment');
  });

  it('should not return appointments for other customers', async () => {
    // Create two customers directly in database
    const customersResult = await db.insert(customersTable)
      .values([
        {
          name: 'John Doe',
          phone: '555-1234',
          email: 'john@example.com',
          address: '123 Main St',
          notes: 'Test customer 1'
        },
        {
          name: 'Jane Doe',
          phone: '555-5678',
          email: 'jane@example.com',
          address: '456 Oak St',
          notes: 'Test customer 2'
        }
      ])
      .returning()
      .execute();

    const [customer1, customer2] = customersResult;

    // Create appointments for both customers
    await db.insert(appointmentsTable)
      .values([
        {
          customer_id: customer1.id,
          appointment_date: new Date('2024-12-25'),
          appointment_time: '10:00',
          status: 'scheduled',
          notes: 'Customer 1 appointment',
          reminder_sent: false
        },
        {
          customer_id: customer2.id,
          appointment_date: new Date('2024-12-25'),
          appointment_time: '14:00',
          status: 'scheduled',
          notes: 'Customer 2 appointment',
          reminder_sent: false
        }
      ])
      .execute();

    // Query appointments for customer1 only
    const input: GetAppointmentsByCustomerInput = {
      customer_id: customer1.id
    };

    const result = await getAppointmentsByCustomer(input);

    expect(result).toHaveLength(1);
    expect(result[0].customer_id).toEqual(customer1.id);
    expect(result[0].notes).toEqual('Customer 1 appointment');
    expect(result[0].notes).not.toEqual('Customer 2 appointment');
  });

  it('should return empty array for non-existent customer', async () => {
    const input: GetAppointmentsByCustomerInput = {
      customer_id: 999 // Non-existent customer ID
    };

    const result = await getAppointmentsByCustomer(input);

    expect(result).toEqual([]);
  });
});
