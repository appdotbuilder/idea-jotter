
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ideasTable } from '../db/schema';
import { type DeleteIdeaInput, type CreateIdeaInput } from '../schema';
import { deleteIdea } from '../handlers/delete_idea';
import { eq } from 'drizzle-orm';

// Test input for creating an idea
const testCreateInput: CreateIdeaInput = {
  title: 'Test Idea',
  description: 'A test idea for deletion',
  category: 'Work Related'
};

describe('deleteIdea', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing idea', async () => {
    // Create a test idea first
    const createdIdea = await db.insert(ideasTable)
      .values({
        title: testCreateInput.title,
        description: testCreateInput.description,
        category: testCreateInput.category
      })
      .returning()
      .execute();

    const ideaId = createdIdea[0].id;
    const deleteInput: DeleteIdeaInput = { id: ideaId };

    // Delete the idea
    const result = await deleteIdea(deleteInput);

    // Verify the response
    expect(result.success).toBe(true);

    // Verify the idea is actually deleted from database
    const deletedIdea = await db.select()
      .from(ideasTable)
      .where(eq(ideasTable.id, ideaId))
      .execute();

    expect(deletedIdea).toHaveLength(0);
  });

  it('should throw error when idea does not exist', async () => {
    const nonExistentId = 999;
    const deleteInput: DeleteIdeaInput = { id: nonExistentId };

    // Attempt to delete non-existent idea
    await expect(deleteIdea(deleteInput)).rejects.toThrow(/not found/i);
  });

  it('should not affect other ideas when deleting one', async () => {
    // Create multiple test ideas
    const idea1 = await db.insert(ideasTable)
      .values({
        title: 'First Idea',
        description: 'First test idea',
        category: 'Work Related'
      })
      .returning()
      .execute();

    const idea2 = await db.insert(ideasTable)
      .values({
        title: 'Second Idea',
        description: 'Second test idea',
        category: 'Hobby'
      })
      .returning()
      .execute();

    const deleteInput: DeleteIdeaInput = { id: idea1[0].id };

    // Delete only the first idea
    const result = await deleteIdea(deleteInput);

    expect(result.success).toBe(true);

    // Verify only the first idea is deleted
    const remainingIdeas = await db.select()
      .from(ideasTable)
      .execute();

    expect(remainingIdeas).toHaveLength(1);
    expect(remainingIdeas[0].id).toEqual(idea2[0].id);
    expect(remainingIdeas[0].title).toEqual('Second Idea');
  });
});
