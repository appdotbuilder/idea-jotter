
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ideasTable } from '../db/schema';
import { type CreateIdeaInput, type FilterIdeasInput } from '../schema';
import { getIdeas } from '../handlers/get_ideas';

// Test data
const testIdea1: CreateIdeaInput = {
  title: 'Work Project',
  description: 'Complete the quarterly report',
  category: 'Work Related'
};

const testIdea2: CreateIdeaInput = {
  title: 'Learn Guitar',
  description: 'Practice guitar for 30 minutes daily',
  category: 'Hobby'
};

const testIdea3: CreateIdeaInput = {
  title: 'Buy Groceries',
  description: 'Get milk, bread, and eggs',
  category: 'To Do'
};

describe('getIdeas', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no ideas exist', async () => {
    const result = await getIdeas();
    expect(result).toHaveLength(0);
  });

  it('should return all ideas when no filter is provided', async () => {
    // Create test ideas
    await db.insert(ideasTable).values([testIdea1, testIdea2, testIdea3]).execute();

    const result = await getIdeas();

    expect(result).toHaveLength(3);
    expect(result.map(idea => idea.title)).toContain('Work Project');
    expect(result.map(idea => idea.title)).toContain('Learn Guitar');
    expect(result.map(idea => idea.title)).toContain('Buy Groceries');
  });

  it('should filter ideas by category', async () => {
    // Create test ideas
    await db.insert(ideasTable).values([testIdea1, testIdea2, testIdea3]).execute();

    const filter: FilterIdeasInput = { category: 'Work Related' };
    const result = await getIdeas(filter);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Work Project');
    expect(result[0].category).toEqual('Work Related');
  });

  it('should return ideas sorted by creation date (newest first)', async () => {
    // Create ideas with slight delay to ensure different timestamps
    await db.insert(ideasTable).values(testIdea1).execute();
    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
    await db.insert(ideasTable).values(testIdea2).execute();
    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
    await db.insert(ideasTable).values(testIdea3).execute();

    const result = await getIdeas();

    expect(result).toHaveLength(3);
    // Newest should be first (Buy Groceries was created last)
    expect(result[0].title).toEqual('Buy Groceries');
    expect(result[1].title).toEqual('Learn Guitar');
    expect(result[2].title).toEqual('Work Project');
    
    // Verify ordering by timestamps
    expect(result[0].created_at.getTime()).toBeGreaterThan(result[1].created_at.getTime());
    expect(result[1].created_at.getTime()).toBeGreaterThan(result[2].created_at.getTime());
  });

  it('should return empty array when filtering by category with no matches', async () => {
    // Create only work-related idea
    await db.insert(ideasTable).values(testIdea1).execute();

    const filter: FilterIdeasInput = { category: 'Hobby' };
    const result = await getIdeas(filter);

    expect(result).toHaveLength(0);
  });

  it('should include all required fields in returned ideas', async () => {
    await db.insert(ideasTable).values(testIdea1).execute();

    const result = await getIdeas();

    expect(result).toHaveLength(1);
    const idea = result[0];
    
    expect(idea.id).toBeDefined();
    expect(typeof idea.id).toBe('number');
    expect(idea.title).toEqual('Work Project');
    expect(idea.description).toEqual('Complete the quarterly report');
    expect(idea.category).toEqual('Work Related');
    expect(idea.created_at).toBeInstanceOf(Date);
    expect(idea.updated_at).toBeInstanceOf(Date);
  });
});
