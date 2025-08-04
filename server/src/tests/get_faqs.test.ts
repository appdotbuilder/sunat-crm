
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { faqsTable } from '../db/schema';
import { getFaqs } from '../handlers/get_faqs';

describe('getFaqs', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no FAQs exist', async () => {
    const result = await getFaqs();
    expect(result).toEqual([]);
  });

  it('should return all FAQs', async () => {
    // Create test FAQs
    await db.insert(faqsTable).values([
      {
        question: 'What are your hours?',
        answer: 'We are open 9-5 Monday through Friday',
        category: 'hours',
        is_active: true
      },
      {
        question: 'How do I schedule an appointment?',
        answer: 'You can call us or use our online booking system',
        category: 'booking',
        is_active: true
      },
      {
        question: 'Do you accept insurance?',
        answer: 'Yes, we accept most major insurance plans',
        category: 'billing',
        is_active: false
      }
    ]).execute();

    const result = await getFaqs();

    expect(result).toHaveLength(3);
    
    // Check first FAQ
    expect(result[0].question).toEqual('What are your hours?');
    expect(result[0].answer).toEqual('We are open 9-5 Monday through Friday');
    expect(result[0].category).toEqual('hours');
    expect(result[0].is_active).toBe(true);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Check that inactive FAQs are included
    const inactiveFaq = result.find(faq => faq.question === 'Do you accept insurance?');
    expect(inactiveFaq).toBeDefined();
    expect(inactiveFaq?.is_active).toBe(false);

    // Check that nullable fields are handled correctly
    const faqWithNullCategory = result.find(faq => faq.category === null);
    if (faqWithNullCategory) {
      expect(faqWithNullCategory.category).toBeNull();
    }
  });

  it('should handle FAQs with null categories', async () => {
    // Create FAQ with null category
    await db.insert(faqsTable).values({
      question: 'Test question',
      answer: 'Test answer',
      category: null,
      is_active: true
    }).execute();

    const result = await getFaqs();

    expect(result).toHaveLength(1);
    expect(result[0].category).toBeNull();
    expect(result[0].question).toEqual('Test question');
    expect(result[0].answer).toEqual('Test answer');
  });
});
