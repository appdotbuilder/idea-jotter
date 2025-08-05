
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ideasTable } from '../db/schema';
import { type CreateIdeaInput, type UpdateIdeaInput } from '../schema';
import { updateIdea } from '../handlers/update_idea';
import { eq } from 'drizzle-orm';

// Helper to create a test idea
const createTestIdea = async (input: CreateIdeaInput) => {
  const result = await db.insert(ideasTable)
    .values({
      title: input.title,
      description: input.description,
      category: input.category
    })
    .returning()
    .execute();
  return result[0];
};

const testIdeaInput: CreateIdeaInput = {
  title: 'Original Title',
  description: 'Original description',
  category: 'Work Related'
};

describe('updateIdea', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of an idea', async () => {
    // Create test idea
    const createdIdea = await createTestIdea(testIdeaInput);

    const updateInput: UpdateIdeaInput = {
      id: createdIdea.id,
      title: 'Updated Title',
      description: 'Updated description',
      category: 'Hobby'
    };

    const result = await updateIdea(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(createdIdea.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.description).toEqual('Updated description');
    expect(result.category).toEqual('Hobby');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(createdIdea.updated_at.getTime());
    expect(result.created_at).toEqual(createdIdea.created_at);
  });

  it('should update only provided fields', async () => {
    // Create test idea
    const createdIdea = await createTestIdea(testIdeaInput);

    const updateInput: UpdateIdeaInput = {
      id: createdIdea.id,
      title: 'Only Title Updated'
    };

    const result = await updateIdea(updateInput);

    // Verify only title was updated
    expect(result.title).toEqual('Only Title Updated');
    expect(result.description).toEqual('Original description');
    expect(result.category).toEqual('Work Related');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(createdIdea.updated_at.getTime());
  });

  it('should save updated idea to database', async () => {
    // Create test idea
    const createdIdea = await createTestIdea(testIdeaInput);

    const updateInput: UpdateIdeaInput = {
      id: createdIdea.id,
      description: 'Database Updated Description',
      category: 'To Do'
    };

    await updateIdea(updateInput);

    // Query database to verify changes
    const savedIdea = await db.select()
      .from(ideasTable)
      .where(eq(ideasTable.id, createdIdea.id))
      .execute();

    expect(savedIdea).toHaveLength(1);
    expect(savedIdea[0].title).toEqual('Original Title'); // Unchanged
    expect(savedIdea[0].description).toEqual('Database Updated Description');
    expect(savedIdea[0].category).toEqual('To Do');
    expect(savedIdea[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when idea does not exist', async () => {
    const updateInput: UpdateIdeaInput = {
      id: 999, // Non-existent ID
      title: 'Should Not Work'
    };

    await expect(updateIdea(updateInput)).rejects.toThrow(/idea with id 999 not found/i);
  });

  it('should update updated_at timestamp even with no other changes', async () => {
    // Create test idea
    const createdIdea = await createTestIdea(testIdeaInput);

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateIdeaInput = {
      id: createdIdea.id
    };

    const result = await updateIdea(updateInput);

    // Verify updated_at was changed even with no field updates
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(createdIdea.updated_at.getTime());
    expect(result.title).toEqual(createdIdea.title);
    expect(result.description).toEqual(createdIdea.description);
    expect(result.category).toEqual(createdIdea.category);
  });
});
