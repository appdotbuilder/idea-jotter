
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ideasTable } from '../db/schema';
import { type CreateIdeaInput } from '../schema';
import { getIdeaById } from '../handlers/get_idea_by_id';

// Test input for creating ideas
const testInput: CreateIdeaInput = {
  title: 'Test Idea',
  description: 'A test idea for testing',
  category: 'Work Related'
};

describe('getIdeaById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return idea when found', async () => {
    // Create test idea first
    const createdIdea = await db.insert(ideasTable)
      .values({
        title: testInput.title,
        description: testInput.description,
        category: testInput.category
      })
      .returning()
      .execute();

    const ideaId = createdIdea[0].id;

    // Test getting the idea
    const result = await getIdeaById(ideaId);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(ideaId);
    expect(result!.title).toEqual('Test Idea');
    expect(result!.description).toEqual(testInput.description);
    expect(result!.category).toEqual('Work Related');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when idea not found', async () => {
    const result = await getIdeaById(999); // Non-existent ID

    expect(result).toBeNull();
  });

  it('should return correct idea among multiple ideas', async () => {
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

    // Test getting specific idea
    const result = await getIdeaById(idea2[0].id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(idea2[0].id);
    expect(result!.title).toEqual('Second Idea');
    expect(result!.description).toEqual('Second test idea');
    expect(result!.category).toEqual('Hobby');
  });
});
