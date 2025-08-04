
import { db } from '../db';
import { customersTable } from '../db/schema';
import { type GetCustomerByIdInput, type Customer } from '../schema';
import { eq } from 'drizzle-orm';

export const getCustomerById = async (input: GetCustomerByIdInput): Promise<Customer | null> => {
  try {
    const results = await db.select()
      .from(customersTable)
      .where(eq(customersTable.id, input.id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Get customer by ID failed:', error);
    throw error;
  }
};
