
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { faqsTable } from '../db/schema';
import { type CreateFaqInput, type DeleteFaqInput } from '../schema';
import { deleteFaq } from '../handlers/delete_faq';
import { eq } from 'drizzle-orm';

// Test FAQ data
const testFaq: CreateFaqInput = {
  question: 'What are your hours?',
  answer: 'We are open Monday to Friday, 9am to 5pm.',
  category: 'General',
  is_active: true
};

describe('deleteFaq', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing FAQ', async () => {
    // Create a test FAQ first
    const createResult = await db.insert(faqsTable)
      .values({
        question: testFaq.question,
        answer: testFaq.answer,
        category: testFaq.category,
        is_active: testFaq.is_active
      })
      .returning()
      .execute();

    const createdFaq = createResult[0];
    
    const deleteInput: DeleteFaqInput = {
      id: createdFaq.id
    };

    // Delete the FAQ
    const result = await deleteFaq(deleteInput);

    expect(result).toBe(true);

    // Verify FAQ was deleted from database
    const faqs = await db.select()
      .from(faqsTable)
      .where(eq(faqsTable.id, createdFaq.id))
      .execute();

    expect(faqs).toHaveLength(0);
  });

  it('should return false when FAQ does not exist', async () => {
    const deleteInput: DeleteFaqInput = {
      id: 999999
    };

    const result = await deleteFaq(deleteInput);

    expect(result).toBe(false);
  });

  it('should not affect other FAQs when deleting one', async () => {
    // Create two test FAQs
    const faq1Result = await db.insert(faqsTable)
      .values({
        question: 'First FAQ',
        answer: 'First answer',
        category: 'Category 1',
        is_active: true
      })
      .returning()
      .execute();

    const faq2Result = await db.insert(faqsTable)
      .values({
        question: 'Second FAQ',
        answer: 'Second answer',
        category: 'Category 2',
        is_active: true
      })
      .returning()
      .execute();

    const faq1 = faq1Result[0];
    const faq2 = faq2Result[0];

    // Delete only the first FAQ
    const deleteInput: DeleteFaqInput = {
      id: faq1.id
    };

    const result = await deleteFaq(deleteInput);

    expect(result).toBe(true);

    // Verify first FAQ was deleted
    const deletedFaq = await db.select()
      .from(faqsTable)
      .where(eq(faqsTable.id, faq1.id))
      .execute();

    expect(deletedFaq).toHaveLength(0);

    // Verify second FAQ still exists
    const remainingFaq = await db.select()
      .from(faqsTable)
      .where(eq(faqsTable.id, faq2.id))
      .execute();

    expect(remainingFaq).toHaveLength(1);
    expect(remainingFaq[0].question).toEqual('Second FAQ');
  });
});
