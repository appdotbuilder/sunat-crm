
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { faqsTable } from '../db/schema';
import { type UpdateFaqInput, type CreateFaqInput } from '../schema';
import { updateFaq } from '../handlers/update_faq';
import { eq } from 'drizzle-orm';

// Test data
const createTestFaq = async (): Promise<number> => {
  const faqData: CreateFaqInput = {
    question: 'Original Question',
    answer: 'Original Answer',
    category: 'Original Category',
    is_active: true
  };

  const result = await db.insert(faqsTable)
    .values(faqData)
    .returning()
    .execute();

  return result[0].id;
};

describe('updateFaq', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update FAQ question', async () => {
    const faqId = await createTestFaq();

    const updateInput: UpdateFaqInput = {
      id: faqId,
      question: 'Updated Question'
    };

    const result = await updateFaq(updateInput);

    expect(result.id).toEqual(faqId);
    expect(result.question).toEqual('Updated Question');
    expect(result.answer).toEqual('Original Answer'); // Should remain unchanged
    expect(result.category).toEqual('Original Category'); // Should remain unchanged
    expect(result.is_active).toEqual(true); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update FAQ answer', async () => {
    const faqId = await createTestFaq();

    const updateInput: UpdateFaqInput = {
      id: faqId,
      answer: 'Updated Answer'
    };

    const result = await updateFaq(updateInput);

    expect(result.question).toEqual('Original Question'); // Should remain unchanged
    expect(result.answer).toEqual('Updated Answer');
    expect(result.category).toEqual('Original Category'); // Should remain unchanged
    expect(result.is_active).toEqual(true); // Should remain unchanged
  });

  it('should update FAQ category', async () => {
    const faqId = await createTestFaq();

    const updateInput: UpdateFaqInput = {
      id: faqId,
      category: 'Updated Category'
    };

    const result = await updateFaq(updateInput);

    expect(result.question).toEqual('Original Question'); // Should remain unchanged
    expect(result.answer).toEqual('Original Answer'); // Should remain unchanged
    expect(result.category).toEqual('Updated Category');
    expect(result.is_active).toEqual(true); // Should remain unchanged
  });

  it('should update FAQ active status', async () => {
    const faqId = await createTestFaq();

    const updateInput: UpdateFaqInput = {
      id: faqId,
      is_active: false
    };

    const result = await updateFaq(updateInput);

    expect(result.question).toEqual('Original Question'); // Should remain unchanged
    expect(result.answer).toEqual('Original Answer'); // Should remain unchanged
    expect(result.category).toEqual('Original Category'); // Should remain unchanged
    expect(result.is_active).toEqual(false);
  });

  it('should update multiple fields at once', async () => {
    const faqId = await createTestFaq();

    const updateInput: UpdateFaqInput = {
      id: faqId,
      question: 'New Question',
      answer: 'New Answer',
      category: null,
      is_active: false
    };

    const result = await updateFaq(updateInput);

    expect(result.question).toEqual('New Question');
    expect(result.answer).toEqual('New Answer');
    expect(result.category).toBeNull();
    expect(result.is_active).toEqual(false);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated FAQ to database', async () => {
    const faqId = await createTestFaq();

    const updateInput: UpdateFaqInput = {
      id: faqId,
      question: 'Database Updated Question',
      is_active: false
    };

    await updateFaq(updateInput);

    // Verify in database
    const faqs = await db.select()
      .from(faqsTable)
      .where(eq(faqsTable.id, faqId))
      .execute();

    expect(faqs).toHaveLength(1);
    expect(faqs[0].question).toEqual('Database Updated Question');
    expect(faqs[0].answer).toEqual('Original Answer'); // Should remain unchanged
    expect(faqs[0].is_active).toEqual(false);
    expect(faqs[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent FAQ', async () => {
    const updateInput: UpdateFaqInput = {
      id: 99999,
      question: 'Updated Question'
    };

    expect(updateFaq(updateInput)).rejects.toThrow(/FAQ with id 99999 not found/i);
  });

  it('should update updated_at timestamp', async () => {
    const faqId = await createTestFaq();

    // Get original timestamp
    const originalFaq = await db.select()
      .from(faqsTable)
      .where(eq(faqsTable.id, faqId))
      .execute();

    const originalUpdatedAt = originalFaq[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateFaqInput = {
      id: faqId,
      question: 'Updated Question'
    };

    const result = await updateFaq(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > originalUpdatedAt).toBe(true);
  });
});
