
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ideasTable } from '../db/schema';
import { type CreateIdeaInput } from '../schema';
import { createIdea } from '../handlers/create_idea';
import { eq } from 'drizzle-orm';

// Test input for creating an idea
const testInput: CreateIdeaInput = {
  title: 'Test Idea',
  description: 'A test idea for unit testing',
  category: 'Work Related'
};

describe('createIdea', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an idea', async () => {
    const result = await createIdea(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Idea');
    expect(result.description).toEqual(testInput.description);
    expect(result.category).toEqual('Work Related');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save idea to database', async () => {
    const result = await createIdea(testInput);

    // Query using proper drizzle syntax
    const ideas = await db.select()
      .from(ideasTable)
      .where(eq(ideasTable.id, result.id))
      .execute();

    expect(ideas).toHaveLength(1);
    expect(ideas[0].title).toEqual('Test Idea');
    expect(ideas[0].description).toEqual(testInput.description);
    expect(ideas[0].category).toEqual('Work Related');
    expect(ideas[0].created_at).toBeInstanceOf(Date);
    expect(ideas[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create ideas with different categories', async () => {
    const hobbyInput: CreateIdeaInput = {
      title: 'Hobby Idea',
      description: 'An idea for hobbies',
      category: 'Hobby'
    };

    const todoInput: CreateIdeaInput = {
      title: 'Todo Idea',
      description: 'A todo item',
      category: 'To Do'
    };

    const hobbyResult = await createIdea(hobbyInput);
    const todoResult = await createIdea(todoInput);

    expect(hobbyResult.category).toEqual('Hobby');
    expect(todoResult.category).toEqual('To Do');

    // Verify both are saved to database
    const allIdeas = await db.select()
      .from(ideasTable)
      .execute();

    expect(allIdeas).toHaveLength(2);
    expect(allIdeas.some(idea => idea.category === 'Hobby')).toBe(true);
    expect(allIdeas.some(idea => idea.category === 'To Do')).toBe(true);
  });
});
