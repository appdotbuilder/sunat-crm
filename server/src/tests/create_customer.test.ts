
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { customersTable } from '../db/schema';
import { type CreateCustomerInput } from '../schema';
import { createCustomer } from '../handlers/create_customer';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateCustomerInput = {
  name: 'John Doe',
  phone: '+1234567890',
  email: 'john@example.com',
  address: '123 Main St, City, State',
  notes: 'Test customer notes'
};

// Test input with minimal required fields
const minimalInput: CreateCustomerInput = {
  name: 'Jane Smith',
  phone: '+0987654321',
  email: null,
  address: null,
  notes: null
};

describe('createCustomer', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a customer with all fields', async () => {
    const result = await createCustomer(testInput);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.phone).toEqual('+1234567890');
    expect(result.email).toEqual('john@example.com');
    expect(result.address).toEqual('123 Main St, City, State');
    expect(result.notes).toEqual('Test customer notes');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a customer with minimal required fields', async () => {
    const result = await createCustomer(minimalInput);

    // Basic field validation
    expect(result.name).toEqual('Jane Smith');
    expect(result.phone).toEqual('+0987654321');
    expect(result.email).toBeNull();
    expect(result.address).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save customer to database', async () => {
    const result = await createCustomer(testInput);

    // Query using proper drizzle syntax
    const customers = await db.select()
      .from(customersTable)
      .where(eq(customersTable.id, result.id))
      .execute();

    expect(customers).toHaveLength(1);
    expect(customers[0].name).toEqual('John Doe');
    expect(customers[0].phone).toEqual('+1234567890');
    expect(customers[0].email).toEqual('john@example.com');
    expect(customers[0].address).toEqual('123 Main St, City, State');
    expect(customers[0].notes).toEqual('Test customer notes');
    expect(customers[0].created_at).toBeInstanceOf(Date);
    expect(customers[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null values correctly', async () => {
    const result = await createCustomer(minimalInput);

    // Query database to verify null handling
    const customers = await db.select()
      .from(customersTable)
      .where(eq(customersTable.id, result.id))
      .execute();

    expect(customers).toHaveLength(1);
    expect(customers[0].name).toEqual('Jane Smith');
    expect(customers[0].phone).toEqual('+0987654321');
    expect(customers[0].email).toBeNull();
    expect(customers[0].address).toBeNull();
    expect(customers[0].notes).toBeNull();
  });

  it('should generate unique IDs for multiple customers', async () => {
    const result1 = await createCustomer({
      name: 'Customer 1',
      phone: '+1111111111',
      email: null,
      address: null,
      notes: null
    });

    const result2 = await createCustomer({
      name: 'Customer 2',
      phone: '+2222222222',
      email: null,
      address: null,
      notes: null
    });

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.name).toEqual('Customer 1');
    expect(result2.name).toEqual('Customer 2');
  });
});
