
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { messageTemplatesTable } from '../db/schema';
import { type CreateMessageTemplateInput } from '../schema';
import { getMessageTemplates } from '../handlers/get_message_templates';

describe('getMessageTemplates', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no message templates exist', async () => {
    const result = await getMessageTemplates();
    expect(result).toEqual([]);
  });

  it('should return all message templates', async () => {
    // Create test message templates
    const template1: CreateMessageTemplateInput = {
      name: 'Confirmation Template',
      content: 'Your appointment is confirmed for {date} at {time}',
      template_type: 'confirmation',
      is_active: true
    };

    const template2: CreateMessageTemplateInput = {
      name: 'Reminder Template',
      content: 'Reminder: You have an appointment tomorrow at {time}',
      template_type: 'reminder',
      is_active: false
    };

    await db.insert(messageTemplatesTable)
      .values([template1, template2])
      .execute();

    const result = await getMessageTemplates();

    expect(result).toHaveLength(2);
    
    // Check first template
    const confirmationTemplate = result.find(t => t.name === 'Confirmation Template');
    expect(confirmationTemplate).toBeDefined();
    expect(confirmationTemplate?.content).toEqual('Your appointment is confirmed for {date} at {time}');
    expect(confirmationTemplate?.template_type).toEqual('confirmation');
    expect(confirmationTemplate?.is_active).toBe(true);
    expect(confirmationTemplate?.id).toBeDefined();
    expect(confirmationTemplate?.created_at).toBeInstanceOf(Date);
    expect(confirmationTemplate?.updated_at).toBeInstanceOf(Date);

    // Check second template
    const reminderTemplate = result.find(t => t.name === 'Reminder Template');
    expect(reminderTemplate).toBeDefined();
    expect(reminderTemplate?.content).toEqual('Reminder: You have an appointment tomorrow at {time}');
    expect(reminderTemplate?.template_type).toEqual('reminder');
    expect(reminderTemplate?.is_active).toBe(false);
    expect(reminderTemplate?.id).toBeDefined();
    expect(reminderTemplate?.created_at).toBeInstanceOf(Date);
    expect(reminderTemplate?.updated_at).toBeInstanceOf(Date);
  });

  it('should return templates with all template types', async () => {
    // Create templates with different types
    const templates: CreateMessageTemplateInput[] = [
      {
        name: 'Confirmation',
        content: 'Confirmed',
        template_type: 'confirmation',
        is_active: true
      },
      {
        name: 'Reminder',
        content: 'Reminder',
        template_type: 'reminder',
        is_active: true
      },
      {
        name: 'Follow Up',
        content: 'Follow up',
        template_type: 'follow_up',
        is_active: true
      },
      {
        name: 'General',
        content: 'General message',
        template_type: 'general',
        is_active: true
      }
    ];

    await db.insert(messageTemplatesTable)
      .values(templates)
      .execute();

    const result = await getMessageTemplates();

    expect(result).toHaveLength(4);
    
    const templateTypes = result.map(t => t.template_type);
    expect(templateTypes).toContain('confirmation');
    expect(templateTypes).toContain('reminder');
    expect(templateTypes).toContain('follow_up');
    expect(templateTypes).toContain('general');
  });
});
