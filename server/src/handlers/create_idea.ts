
import { db } from '../db';
import { ideasTable } from '../db/schema';
import { type CreateIdeaInput, type Idea } from '../schema';

export const createIdea = async (input: CreateIdeaInput): Promise<Idea> => {
  try {
    // Insert idea record
    const result = await db.insert(ideasTable)
      .values({
        title: input.title,
        description: input.description,
        category: input.category
      })
      .returning()
      .execute();

    // Return the created idea
    return result[0];
  } catch (error) {
    console.error('Idea creation failed:', error);
    throw error;
  }
};
