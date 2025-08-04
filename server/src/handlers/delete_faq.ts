
import { db } from '../db';
import { faqsTable } from '../db/schema';
import { type DeleteFaqInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteFaq = async (input: DeleteFaqInput): Promise<boolean> => {
  try {
    const result = await db.delete(faqsTable)
      .where(eq(faqsTable.id, input.id))
      .execute();

    // Return true if a row was deleted, false if no row was found
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('FAQ deletion failed:', error);
    throw error;
  }
};
