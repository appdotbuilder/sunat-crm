
import { db } from '../db';
import { faqsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetFaqByIdInput, type FAQ } from '../schema';

export const getFaqById = async (input: GetFaqByIdInput): Promise<FAQ | null> => {
  try {
    const results = await db.select()
      .from(faqsTable)
      .where(eq(faqsTable.id, input.id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('FAQ retrieval failed:', error);
    throw error;
  }
};
