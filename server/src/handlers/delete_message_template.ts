
import { db } from '../db';
import { messageTemplatesTable } from '../db/schema';
import { type DeleteMessageTemplateInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteMessageTemplate = async (input: DeleteMessageTemplateInput): Promise<boolean> => {
  try {
    // Delete the message template
    const result = await db.delete(messageTemplatesTable)
      .where(eq(messageTemplatesTable.id, input.id))
      .execute();

    // Return true if a row was deleted, false if no matching template was found
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Message template deletion failed:', error);
    throw error;
  }
};
