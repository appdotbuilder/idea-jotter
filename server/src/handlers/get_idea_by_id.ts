
import { db } from '../db';
import { ideasTable } from '../db/schema';
import { type Idea } from '../schema';
import { eq } from 'drizzle-orm';

export const getIdeaById = async (id: number): Promise<Idea | null> => {
  try {
    const result = await db.select()
      .from(ideasTable)
      .where(eq(ideasTable.id, id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Failed to get idea by id:', error);
    throw error;
  }
};
