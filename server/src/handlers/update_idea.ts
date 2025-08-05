
import { db } from '../db';
import { ideasTable } from '../db/schema';
import { type UpdateIdeaInput, type Idea } from '../schema';
import { eq } from 'drizzle-orm';

export const updateIdea = async (input: UpdateIdeaInput): Promise<Idea> => {
  try {
    // Check if idea exists
    const existingIdea = await db.select()
      .from(ideasTable)
      .where(eq(ideasTable.id, input.id))
      .execute();

    if (existingIdea.length === 0) {
      throw new Error(`Idea with ID ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    if (input.category !== undefined) {
      updateData.category = input.category;
    }

    // Update the idea
    const result = await db.update(ideasTable)
      .set(updateData)
      .where(eq(ideasTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Idea update failed:', error);
    throw error;
  }
};
