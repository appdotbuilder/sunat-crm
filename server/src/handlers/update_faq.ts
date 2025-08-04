
import { db } from '../db';
import { faqsTable } from '../db/schema';
import { type UpdateFaqInput, type FAQ } from '../schema';
import { eq } from 'drizzle-orm';

export const updateFaq = async (input: UpdateFaqInput): Promise<FAQ> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof faqsTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.question !== undefined) {
      updateData.question = input.question;
    }
    if (input.answer !== undefined) {
      updateData.answer = input.answer;
    }
    if (input.category !== undefined) {
      updateData.category = input.category;
    }
    if (input.is_active !== undefined) {
      updateData.is_active = input.is_active;
    }

    // Update FAQ record
    const result = await db.update(faqsTable)
      .set(updateData)
      .where(eq(faqsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`FAQ with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('FAQ update failed:', error);
    throw error;
  }
};
