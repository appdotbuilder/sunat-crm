
import { db } from '../db';
import { messageTemplatesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetMessageTemplateByIdInput, type MessageTemplate } from '../schema';

export const getMessageTemplateById = async (input: GetMessageTemplateByIdInput): Promise<MessageTemplate | null> => {
  try {
    const results = await db.select()
      .from(messageTemplatesTable)
      .where(eq(messageTemplatesTable.id, input.id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Message template retrieval failed:', error);
    throw error;
  }
};
