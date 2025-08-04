
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { customersTable } from '../db/schema';
import { getCustomers } from '../handlers/get_customers';

describe('getCustomers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no customers exist', async () => {
    const result = await getCustomers();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all customers', async () => {
    // Create test customers
    const testCustomers = [
      {
        name: 'John Doe',
        phone: '123-456-7890',
        email: 'john@example.com',
        address: '123 Main St',
        notes: 'Regular customer'
      },
      {
        name: 'Jane Smith',
        phone: '987-654-3210',
        email: null,
        address: null,
        notes: null
      }
    ];

    await db.insert(customersTable)
      .values(testCustomers)
      .execute();

    const result = await getCustomers();

    expect(result).toHaveLength(2);
    
    // Check first customer
    expect(result[0].name).toEqual('John Doe');
    expect(result[0].phone).toEqual('123-456-7890');
    expect(result[0].email).toEqual('john@example.com');
    expect(result[0].address).toEqual('123 Main St');
    expect(result[0].notes).toEqual('Regular customer');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Check second customer
    expect(result[1].name).toEqual('Jane Smith');
    expect(result[1].phone).toEqual('987-654-3210');
    expect(result[1].email).toBeNull();
    expect(result[1].address).toBeNull();
    expect(result[1].notes).toBeNull();
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[1].updated_at).toBeInstanceOf(Date);
  });

  it('should return customers ordered by creation date', async () => {
    // Create customers with slight delay to ensure different timestamps
    await db.insert(customersTable)
      .values({
        name: 'First Customer',
        phone: '111-111-1111',
        email: null,
        address: null,
        notes: null
      })
      .execute();

    // Small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(customersTable)
      .values({
        name: 'Second Customer',
        phone: '222-222-2222',
        email: null,
        address: null,
        notes: null
      })
      .execute();

    const result = await getCustomers();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('First Customer');
    expect(result[1].name).toEqual('Second Customer');
    
    // Verify timestamps are properly ordered
    expect(result[0].created_at.getTime()).toBeLessThanOrEqual(result[1].created_at.getTime());
  });
});
