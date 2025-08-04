
import { db } from '../db';
import { faqsTable } from '../db/schema';
import { type CreateFaqInput, type FAQ } from '../schema';

export const createFaq = async (input: CreateFaqInput): Promise<FAQ> => {
  try {
    // Insert FAQ record
    const result = await db.insert(faqsTable)
      .values({
        question: input.question,
        answer: input.answer,
        category: input.category,
        is_active: input.is_active
      })
      .returning()
      .execute();

    // Return the created FAQ
    return result[0];
  } catch (error) {
    console.error('FAQ creation failed:', error);
    throw error;
  }
};
