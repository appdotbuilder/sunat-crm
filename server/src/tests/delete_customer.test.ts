
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { customersTable } from '../db/schema';
import { type DeleteCustomerInput, type CreateCustomerInput } from '../schema';
import { deleteCustomer } from '../handlers/delete_customer';
import { eq } from 'drizzle-orm';

// Test input for creating a customer to delete
const testCreateInput: CreateCustomerInput = {
  name: 'John Doe',
  phone: '555-1234',
  email: 'john@example.com',
  address: '123 Main St',
  notes: 'Test customer'
};

describe('deleteCustomer', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing customer', async () => {
    // Create a customer first
    const createResult = await db.insert(customersTable)
      .values(testCreateInput)
      .returning()
      .execute();

    const customerId = createResult[0].id;
    const deleteInput: DeleteCustomerInput = { id: customerId };

    // Delete the customer
    const result = await deleteCustomer(deleteInput);

    expect(result).toBe(true);

    // Verify customer was deleted
    const customers = await db.select()
      .from(customersTable)
      .where(eq(customersTable.id, customerId))
      .execute();

    expect(customers).toHaveLength(0);
  });

  it('should return false when deleting non-existent customer', async () => {
    const deleteInput: DeleteCustomerInput = { id: 999 };

    const result = await deleteCustomer(deleteInput);

    expect(result).toBe(false);
  });

  it('should not affect other customers when deleting one', async () => {
    // Create two customers
    const customer1 = await db.insert(customersTable)
      .values({ ...testCreateInput, name: 'Customer 1' })
      .returning()
      .execute();

    const customer2 = await db.insert(customersTable)
      .values({ ...testCreateInput, name: 'Customer 2' })
      .returning()
      .execute();

    // Delete first customer
    const deleteInput: DeleteCustomerInput = { id: customer1[0].id };
    const result = await deleteCustomer(deleteInput);

    expect(result).toBe(true);

    // Verify only first customer was deleted
    const remainingCustomers = await db.select()
      .from(customersTable)
      .execute();

    expect(remainingCustomers).toHaveLength(1);
    expect(remainingCustomers[0].id).toBe(customer2[0].id);
    expect(remainingCustomers[0].name).toBe('Customer 2');
  });
});
