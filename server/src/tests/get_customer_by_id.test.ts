
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { customersTable } from '../db/schema';
import { type GetCustomerByIdInput } from '../schema';
import { getCustomerById } from '../handlers/get_customer_by_id';

// Test input
const testInput: GetCustomerByIdInput = {
  id: 1
};

describe('getCustomerById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return customer when found', async () => {
    // Create test customer first
    const insertResult = await db.insert(customersTable)
      .values({
        name: 'John Doe',
        phone: '555-0123',
        email: 'john@example.com',
        address: '123 Main St',
        notes: 'Regular customer'
      })
      .returning()
      .execute();

    const customerId = insertResult[0].id;

    // Test getting the customer
    const result = await getCustomerById({ id: customerId });

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(customerId);
    expect(result!.name).toEqual('John Doe');
    expect(result!.phone).toEqual('555-0123');
    expect(result!.email).toEqual('john@example.com');
    expect(result!.address).toEqual('123 Main St');
    expect(result!.notes).toEqual('Regular customer');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when customer not found', async () => {
    const result = await getCustomerById({ id: 999 });

    expect(result).toBeNull();
  });

  it('should return customer with nullable fields as null', async () => {
    // Create customer with minimal required fields
    const insertResult = await db.insert(customersTable)
      .values({
        name: 'Jane Smith',
        phone: '555-0456',
        email: null,
        address: null,
        notes: null
      })
      .returning()
      .execute();

    const customerId = insertResult[0].id;

    const result = await getCustomerById({ id: customerId });

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(customerId);
    expect(result!.name).toEqual('Jane Smith');
    expect(result!.phone).toEqual('555-0456');
    expect(result!.email).toBeNull();
    expect(result!.address).toBeNull();
    expect(result!.notes).toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});
