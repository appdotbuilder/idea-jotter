
import { db } from '../db';
import { ideasTable } from '../db/schema';
import { type DeleteIdeaInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteIdea = async (input: DeleteIdeaInput): Promise<{ success: boolean }> => {
  try {
    // First check if the idea exists
    const existingIdea = await db.select()
      .from(ideasTable)
      .where(eq(ideasTable.id, input.id))
      .execute();

    if (existingIdea.length === 0) {
      throw new Error(`Idea with ID ${input.id} not found`);
    }

    // Delete the idea
    const result = await db.delete(ideasTable)
      .where(eq(ideasTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Idea deletion failed:', error);
    throw error;
  }
};
