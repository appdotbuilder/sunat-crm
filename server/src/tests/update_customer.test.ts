
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { customersTable } from '../db/schema';
import { type UpdateCustomerInput, type CreateCustomerInput } from '../schema';
import { updateCustomer } from '../handlers/update_customer';
import { eq } from 'drizzle-orm';

// Test customer data
const testCustomer: CreateCustomerInput = {
  name: 'John Doe',
  phone: '123-456-7890',
  email: 'john@example.com',
  address: '123 Main St',
  notes: 'Regular customer'
};

describe('updateCustomer', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update customer name', async () => {
    // Create initial customer
    const [customer] = await db.insert(customersTable)
      .values(testCustomer)
      .returning()
      .execute();

    const updateInput: UpdateCustomerInput = {
      id: customer.id,
      name: 'Jane Doe'
    };

    const result = await updateCustomer(updateInput);

    expect(result.id).toEqual(customer.id);
    expect(result.name).toEqual('Jane Doe');
    expect(result.phone).toEqual(testCustomer.phone);
    expect(result.email).toEqual(testCustomer.email);
    expect(result.address).toEqual(testCustomer.address);
    expect(result.notes).toEqual(testCustomer.notes);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > customer.updated_at).toBe(true);
  });

  it('should update multiple fields', async () => {
    // Create initial customer
    const [customer] = await db.insert(customersTable)
      .values(testCustomer)
      .returning()
      .execute();

    const updateInput: UpdateCustomerInput = {
      id: customer.id,
      name: 'Jane Smith',
      phone: '987-654-3210',
      email: 'jane@example.com'
    };

    const result = await updateCustomer(updateInput);

    expect(result.name).toEqual('Jane Smith');
    expect(result.phone).toEqual('987-654-3210');
    expect(result.email).toEqual('jane@example.com');
    expect(result.address).toEqual(testCustomer.address); // Unchanged
    expect(result.notes).toEqual(testCustomer.notes); // Unchanged
  });

  it('should update nullable fields to null', async () => {
    // Create initial customer
    const [customer] = await db.insert(customersTable)
      .values(testCustomer)
      .returning()
      .execute();

    const updateInput: UpdateCustomerInput = {
      id: customer.id,
      email: null,
      address: null,
      notes: null
    };

    const result = await updateCustomer(updateInput);

    expect(result.name).toEqual(testCustomer.name); // Unchanged
    expect(result.phone).toEqual(testCustomer.phone); // Unchanged
    expect(result.email).toBeNull();
    expect(result.address).toBeNull();
    expect(result.notes).toBeNull();
  });

  it('should save updated customer to database', async () => {
    // Create initial customer
    const [customer] = await db.insert(customersTable)
      .values(testCustomer)
      .returning()
      .execute();

    const updateInput: UpdateCustomerInput = {
      id: customer.id,
      name: 'Updated Name',
      phone: '555-555-5555'
    };

    await updateCustomer(updateInput);

    // Verify in database
    const customers = await db.select()
      .from(customersTable)
      .where(eq(customersTable.id, customer.id))
      .execute();

    expect(customers).toHaveLength(1);
    expect(customers[0].name).toEqual('Updated Name');
    expect(customers[0].phone).toEqual('555-555-5555');
    expect(customers[0].email).toEqual(testCustomer.email); // Unchanged
  });

  it('should throw error for non-existent customer', async () => {
    const updateInput: UpdateCustomerInput = {
      id: 999,
      name: 'Non-existent Customer'
    };

    expect(updateCustomer(updateInput)).rejects.toThrow(/Customer with id 999 not found/i);
  });

  it('should update only the updated_at timestamp when no fields provided', async () => {
    // Create initial customer
    const [customer] = await db.insert(customersTable)
      .values(testCustomer)
      .returning()
      .execute();

    const updateInput: UpdateCustomerInput = {
      id: customer.id
    };

    const result = await updateCustomer(updateInput);

    // All fields should remain the same except updated_at
    expect(result.name).toEqual(customer.name);
    expect(result.phone).toEqual(customer.phone);
    expect(result.email).toEqual(customer.email);
    expect(result.address).toEqual(customer.address);
    expect(result.notes).toEqual(customer.notes);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > customer.updated_at).toBe(true);
  });
});
