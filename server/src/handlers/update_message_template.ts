
import { db } from '../db';
import { messageTemplatesTable } from '../db/schema';
import { type UpdateMessageTemplateInput, type MessageTemplate } from '../schema';
import { eq } from 'drizzle-orm';

export const updateMessageTemplate = async (input: UpdateMessageTemplateInput): Promise<MessageTemplate> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    
    if (input.content !== undefined) {
      updateData.content = input.content;
    }
    
    if (input.template_type !== undefined) {
      updateData.template_type = input.template_type;
    }
    
    if (input.is_active !== undefined) {
      updateData.is_active = input.is_active;
    }
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Update message template record
    const result = await db.update(messageTemplatesTable)
      .set(updateData)
      .where(eq(messageTemplatesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Message template with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Message template update failed:', error);
    throw error;
  }
};
