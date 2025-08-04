
import { db } from '../db';
import { customersTable } from '../db/schema';
import { type DeleteCustomerInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteCustomer = async (input: DeleteCustomerInput): Promise<boolean> => {
  try {
    // Delete customer record
    const result = await db.delete(customersTable)
      .where(eq(customersTable.id, input.id))
      .execute();

    // Return true if at least one row was affected
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Customer deletion failed:', error);
    throw error;
  }
};
