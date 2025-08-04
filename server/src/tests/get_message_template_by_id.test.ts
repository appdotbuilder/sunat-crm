
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { messageTemplatesTable } from '../db/schema';
import { type CreateMessageTemplateInput } from '../schema';
import { getMessageTemplateById } from '../handlers/get_message_template_by_id';

// Test message template data
const testTemplate: CreateMessageTemplateInput = {
  name: 'Test Template',
  content: 'Hello {{name}}, your appointment is confirmed for {{date}}.',
  template_type: 'confirmation',
  is_active: true
};

describe('getMessageTemplateById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return message template when found', async () => {
    // Create test message template
    const insertResult = await db.insert(messageTemplatesTable)
      .values(testTemplate)
      .returning()
      .execute();

    const templateId = insertResult[0].id;

    // Test retrieval
    const result = await getMessageTemplateById({ id: templateId });

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(templateId);
    expect(result!.name).toEqual('Test Template');
    expect(result!.content).toEqual('Hello {{name}}, your appointment is confirmed for {{date}}.');
    expect(result!.template_type).toEqual('confirmation');
    expect(result!.is_active).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when message template not found', async () => {
    const result = await getMessageTemplateById({ id: 999 });

    expect(result).toBeNull();
  });

  it('should return correct template among multiple templates', async () => {
    // Create multiple message templates
    const template1 = await db.insert(messageTemplatesTable)
      .values({
        name: 'Confirmation Template',
        content: 'Your appointment is confirmed.',
        template_type: 'confirmation',
        is_active: true
      })
      .returning()
      .execute();

    const template2 = await db.insert(messageTemplatesTable)
      .values({
        name: 'Reminder Template',
        content: 'Don\'t forget your appointment tomorrow.',
        template_type: 'reminder',
        is_active: false
      })
      .returning()
      .execute();

    // Test retrieving specific template
    const result = await getMessageTemplateById({ id: template2[0].id });

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(template2[0].id);
    expect(result!.name).toEqual('Reminder Template');
    expect(result!.content).toEqual('Don\'t forget your appointment tomorrow.');
    expect(result!.template_type).toEqual('reminder');
    expect(result!.is_active).toEqual(false);
  });
});
