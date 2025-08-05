
import { db } from '../db';
import { ideasTable } from '../db/schema';
import { type Idea, type FilterIdeasInput } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getIdeas = async (input?: FilterIdeasInput): Promise<Idea[]> => {
  try {
    // Build query with method chaining to avoid type issues
    const baseQuery = db.select().from(ideasTable);
    
    const query = input?.category 
      ? baseQuery.where(eq(ideasTable.category, input.category)).orderBy(desc(ideasTable.created_at))
      : baseQuery.orderBy(desc(ideasTable.created_at));

    const results = await query.execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch ideas:', error);
    throw error;
  }
};
