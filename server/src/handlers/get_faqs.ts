
import { db } from '../db';
import { faqsTable } from '../db/schema';
import { type FAQ } from '../schema';

export const getFaqs = async (): Promise<FAQ[]> => {
  try {
    const results = await db.select()
      .from(faqsTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch FAQs:', error);
    throw error;
  }
};
