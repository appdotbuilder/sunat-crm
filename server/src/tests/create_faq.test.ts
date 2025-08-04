
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { faqsTable } from '../db/schema';
import { type CreateFaqInput } from '../schema';
import { createFaq } from '../handlers/create_faq';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateFaqInput = {
  question: 'What are your business hours?',
  answer: 'We are open Monday to Friday, 9 AM to 6 PM.',
  category: 'General',
  is_active: true
};

describe('createFaq', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an FAQ', async () => {
    const result = await createFaq(testInput);

    // Basic field validation
    expect(result.question).toEqual('What are your business hours?');
    expect(result.answer).toEqual('We are open Monday to Friday, 9 AM to 6 PM.');
    expect(result.category).toEqual('General');
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save FAQ to database', async () => {
    const result = await createFaq(testInput);

    // Query using proper drizzle syntax
    const faqs = await db.select()
      .from(faqsTable)
      .where(eq(faqsTable.id, result.id))
      .execute();

    expect(faqs).toHaveLength(1);
    expect(faqs[0].question).toEqual('What are your business hours?');
    expect(faqs[0].answer).toEqual('We are open Monday to Friday, 9 AM to 6 PM.');
    expect(faqs[0].category).toEqual('General');
    expect(faqs[0].is_active).toEqual(true);
    expect(faqs[0].created_at).toBeInstanceOf(Date);
    expect(faqs[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create FAQ with null category', async () => {
    const inputWithNullCategory: CreateFaqInput = {
      question: 'How do I contact support?',
      answer: 'You can reach us at support@example.com',
      category: null,
      is_active: true
    };

    const result = await createFaq(inputWithNullCategory);

    expect(result.question).toEqual('How do I contact support?');
    expect(result.answer).toEqual('You can reach us at support@example.com');
    expect(result.category).toBeNull();
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
  });

  it('should create FAQ with default is_active value', async () => {
    const inputWithDefaults: CreateFaqInput = {
      question: 'What is your return policy?',
      answer: 'We accept returns within 30 days.',
      category: 'Policy',
      is_active: true // This will be the default from Zod
    };

    const result = await createFaq(inputWithDefaults);

    expect(result.question).toEqual('What is your return policy?');
    expect(result.answer).toEqual('We accept returns within 30 days.');
    expect(result.category).toEqual('Policy');
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
  });

  it('should create inactive FAQ', async () => {
    const inactiveInput: CreateFaqInput = {
      question: 'Temporary question',
      answer: 'Temporary answer',
      category: 'Temp',
      is_active: false
    };

    const result = await createFaq(inactiveInput);

    expect(result.question).toEqual('Temporary question');
    expect(result.answer).toEqual('Temporary answer');
    expect(result.category).toEqual('Temp');
    expect(result.is_active).toEqual(false);
    expect(result.id).toBeDefined();
  });
});
