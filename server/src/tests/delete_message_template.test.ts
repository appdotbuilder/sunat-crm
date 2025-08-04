
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { messageTemplatesTable } from '../db/schema';
import { type CreateMessageTemplateInput, type DeleteMessageTemplateInput } from '../schema';
import { deleteMessageTemplate } from '../handlers/delete_message_template';
import { eq } from 'drizzle-orm';

// Test input for creating a message template
const testTemplateInput: CreateMessageTemplateInput = {
  name: 'Test Template',
  content: 'This is a test message template content',
  template_type: 'general',
  is_active: true
};

describe('deleteMessageTemplate', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing message template', async () => {
    // Create a message template first
    const createResult = await db.insert(messageTemplatesTable)
      .values({
        name: testTemplateInput.name,
        content: testTemplateInput.content,
        template_type: testTemplateInput.template_type,
        is_active: testTemplateInput.is_active
      })
      .returning()
      .execute();

    const templateId = createResult[0].id;

    // Delete the message template
    const deleteInput: DeleteMessageTemplateInput = { id: templateId };
    const result = await deleteMessageTemplate(deleteInput);

    expect(result).toBe(true);

    // Verify the message template was deleted from database
    const templates = await db.select()
      .from(messageTemplatesTable)
      .where(eq(messageTemplatesTable.id, templateId))
      .execute();

    expect(templates).toHaveLength(0);
  });

  it('should return false when deleting non-existent message template', async () => {
    const deleteInput: DeleteMessageTemplateInput = { id: 999 };
    const result = await deleteMessageTemplate(deleteInput);

    expect(result).toBe(false);
  });

  it('should not affect other message templates when deleting one', async () => {
    // Create two message templates
    const template1 = await db.insert(messageTemplatesTable)
      .values({
        name: 'Template 1',
        content: 'Content 1',
        template_type: 'confirmation',
        is_active: true
      })
      .returning()
      .execute();

    const template2 = await db.insert(messageTemplatesTable)
      .values({
        name: 'Template 2',
        content: 'Content 2',
        template_type: 'reminder',
        is_active: true
      })
      .returning()
      .execute();

    // Delete only the first template
    const deleteInput: DeleteMessageTemplateInput = { id: template1[0].id };
    const result = await deleteMessageTemplate(deleteInput);

    expect(result).toBe(true);

    // Verify first template is deleted
    const deletedTemplates = await db.select()
      .from(messageTemplatesTable)
      .where(eq(messageTemplatesTable.id, template1[0].id))
      .execute();

    expect(deletedTemplates).toHaveLength(0);

    // Verify second template still exists
    const remainingTemplates = await db.select()
      .from(messageTemplatesTable)
      .where(eq(messageTemplatesTable.id, template2[0].id))
      .execute();

    expect(remainingTemplates).toHaveLength(1);
    expect(remainingTemplates[0].name).toEqual('Template 2');
  });
});
