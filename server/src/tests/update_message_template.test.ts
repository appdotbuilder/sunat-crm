
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { messageTemplatesTable } from '../db/schema';
import { type CreateMessageTemplateInput, type UpdateMessageTemplateInput } from '../schema';
import { updateMessageTemplate } from '../handlers/update_message_template';
import { eq } from 'drizzle-orm';

// Helper to create a test message template
const createTestTemplate = async (): Promise<number> => {
  const testTemplate: CreateMessageTemplateInput = {
    name: 'Test Template',
    content: 'This is a test template content',
    template_type: 'general',
    is_active: true
  };

  const result = await db.insert(messageTemplatesTable)
    .values(testTemplate)
    .returning()
    .execute();

  return result[0].id;
};

describe('updateMessageTemplate', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a message template with all fields', async () => {
    const templateId = await createTestTemplate();

    const updateInput: UpdateMessageTemplateInput = {
      id: templateId,
      name: 'Updated Template Name',
      content: 'Updated template content',
      template_type: 'confirmation',
      is_active: false
    };

    const result = await updateMessageTemplate(updateInput);

    expect(result.id).toEqual(templateId);
    expect(result.name).toEqual('Updated Template Name');
    expect(result.content).toEqual('Updated template content');
    expect(result.template_type).toEqual('confirmation');
    expect(result.is_active).toEqual(false);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    const templateId = await createTestTemplate();

    const updateInput: UpdateMessageTemplateInput = {
      id: templateId,
      name: 'Updated Name Only'
    };

    const result = await updateMessageTemplate(updateInput);

    expect(result.id).toEqual(templateId);
    expect(result.name).toEqual('Updated Name Only');
    expect(result.content).toEqual('This is a test template content'); // Original value
    expect(result.template_type).toEqual('general'); // Original value
    expect(result.is_active).toEqual(true); // Original value
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated message template to database', async () => {
    const templateId = await createTestTemplate();

    const updateInput: UpdateMessageTemplateInput = {
      id: templateId,
      name: 'Database Test Update',
      template_type: 'reminder'
    };

    await updateMessageTemplate(updateInput);

    // Verify changes are persisted in database
    const templates = await db.select()
      .from(messageTemplatesTable)
      .where(eq(messageTemplatesTable.id, templateId))
      .execute();

    expect(templates).toHaveLength(1);
    expect(templates[0].name).toEqual('Database Test Update');
    expect(templates[0].template_type).toEqual('reminder');
    expect(templates[0].content).toEqual('This is a test template content'); // Unchanged
    expect(templates[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when message template not found', async () => {
    const updateInput: UpdateMessageTemplateInput = {
      id: 99999, // Non-existent ID
      name: 'Should Fail'
    };

    expect(updateMessageTemplate(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should update is_active status correctly', async () => {
    const templateId = await createTestTemplate();

    // Update to inactive
    const updateInput: UpdateMessageTemplateInput = {
      id: templateId,
      is_active: false
    };

    const result = await updateMessageTemplate(updateInput);

    expect(result.is_active).toEqual(false);
    expect(result.name).toEqual('Test Template'); // Unchanged
    expect(result.template_type).toEqual('general'); // Unchanged
  });

  it('should handle all template types', async () => {
    const templateId = await createTestTemplate();

    const templateTypes = ['confirmation', 'reminder', 'follow_up', 'general'] as const;

    for (const templateType of templateTypes) {
      const updateInput: UpdateMessageTemplateInput = {
        id: templateId,
        template_type: templateType
      };

      const result = await updateMessageTemplate(updateInput);
      expect(result.template_type).toEqual(templateType);
    }
  });
});
