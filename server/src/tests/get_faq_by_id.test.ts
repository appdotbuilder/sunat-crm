
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { faqsTable } from '../db/schema';
import { type GetFaqByIdInput, type CreateFaqInput } from '../schema';
import { getFaqById } from '../handlers/get_faq_by_id';

// Test input for creating FAQ
const testFaqInput: CreateFaqInput = {
  question: 'What are your business hours?',
  answer: 'We are open Monday through Friday from 9 AM to 5 PM.',
  category: 'General',
  is_active: true
};

describe('getFaqById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should retrieve an FAQ by ID', async () => {
    // Create a test FAQ first
    const insertResult = await db.insert(faqsTable)
      .values({
        question: testFaqInput.question,
        answer: testFaqInput.answer,
        category: testFaqInput.category,
        is_active: testFaqInput.is_active
      })
      .returning()
      .execute();

    const createdFaq = insertResult[0];
    const input: GetFaqByIdInput = { id: createdFaq.id };

    const result = await getFaqById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdFaq.id);
    expect(result!.question).toEqual('What are your business hours?');
    expect(result!.answer).toEqual('We are open Monday through Friday from 9 AM to 5 PM.');
    expect(result!.category).toEqual('General');
    expect(result!.is_active).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent FAQ', async () => {
    const input: GetFaqByIdInput = { id: 99999 };

    const result = await getFaqById(input);

    expect(result).toBeNull();
  });

  it('should retrieve FAQ with nullable fields', async () => {
    // Create FAQ with minimal required fields (category as null)
    const insertResult = await db.insert(faqsTable)
      .values({
        question: 'How do I contact support?',
        answer: 'You can email us at support@example.com',
        category: null,
        is_active: false
      })
      .returning()
      .execute();

    const createdFaq = insertResult[0];
    const input: GetFaqByIdInput = { id: createdFaq.id };

    const result = await getFaqById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdFaq.id);
    expect(result!.question).toEqual('How do I contact support?');
    expect(result!.answer).toEqual('You can email us at support@example.com');
    expect(result!.category).toBeNull();
    expect(result!.is_active).toEqual(false);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});
