
import { db } from '../db';
import { messageTemplatesTable } from '../db/schema';
import { type CreateMessageTemplateInput, type MessageTemplate } from '../schema';

export const createMessageTemplate = async (input: CreateMessageTemplateInput): Promise<MessageTemplate> => {
  try {
    // Insert message template record
    const result = await db.insert(messageTemplatesTable)
      .values({
        name: input.name,
        content: input.content,
        template_type: input.template_type,
        is_active: input.is_active
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Message template creation failed:', error);
    throw error;
  }
};
