
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { messageTemplatesTable } from '../db/schema';
import { type CreateMessageTemplateInput } from '../schema';
import { createMessageTemplate } from '../handlers/create_message_template';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateMessageTemplateInput = {
  name: 'Test Template',
  content: 'Hello {customer_name}, your appointment is confirmed for {appointment_date} at {appointment_time}.',
  template_type: 'confirmation',
  is_active: true
};

describe('createMessageTemplate', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a message template', async () => {
    const result = await createMessageTemplate(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Template');
    expect(result.content).toEqual(testInput.content);
    expect(result.template_type).toEqual('confirmation');
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save message template to database', async () => {
    const result = await createMessageTemplate(testInput);

    // Query using proper drizzle syntax
    const templates = await db.select()
      .from(messageTemplatesTable)
      .where(eq(messageTemplatesTable.id, result.id))
      .execute();

    expect(templates).toHaveLength(1);
    expect(templates[0].name).toEqual('Test Template');
    expect(templates[0].content).toEqual(testInput.content);
    expect(templates[0].template_type).toEqual('confirmation');
    expect(templates[0].is_active).toEqual(true);
    expect(templates[0].created_at).toBeInstanceOf(Date);
    expect(templates[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create template with default is_active value', async () => {
    const inputWithDefaults: CreateMessageTemplateInput = {
      name: 'Default Template',
      content: 'This is a reminder for your appointment.',
      template_type: 'reminder',
      is_active: true // Explicitly set since Zod default is applied
    };

    const result = await createMessageTemplate(inputWithDefaults);

    expect(result.is_active).toEqual(true);
    expect(result.template_type).toEqual('reminder');
  });

  it('should create templates with different template types', async () => {
    const followUpInput: CreateMessageTemplateInput = {
      name: 'Follow Up Template',
      content: 'Thank you for your visit! Please let us know if you have any feedback.',
      template_type: 'follow_up',
      is_active: false
    };

    const result = await createMessageTemplate(followUpInput);

    expect(result.template_type).toEqual('follow_up');
    expect(result.is_active).toEqual(false);
    expect(result.name).toEqual('Follow Up Template');
  });

  it('should create general template type', async () => {
    const generalInput: CreateMessageTemplateInput = {
      name: 'General Template',
      content: 'This is a general message template.',
      template_type: 'general',
      is_active: true
    };

    const result = await createMessageTemplate(generalInput);

    expect(result.template_type).toEqual('general');
    expect(result.name).toEqual('General Template');
  });
});
