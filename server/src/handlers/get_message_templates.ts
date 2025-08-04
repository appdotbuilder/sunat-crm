
import { db } from '../db';
import { messageTemplatesTable } from '../db/schema';
import { type MessageTemplate } from '../schema';

export const getMessageTemplates = async (): Promise<MessageTemplate[]> => {
  try {
    const results = await db.select()
      .from(messageTemplatesTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get message templates:', error);
    throw error;
  }
};
