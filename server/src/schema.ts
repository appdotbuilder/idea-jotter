
import { z } from 'zod';

// Available categories enum
export const ideaCategorySchema = z.enum(['Work Related', 'Hobby', 'To Do']);
export type IdeaCategory = z.infer<typeof ideaCategorySchema>;

// Idea schema
export const ideaSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: ideaCategorySchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Idea = z.infer<typeof ideaSchema>;

// Input schema for creating ideas
export const createIdeaInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: ideaCategorySchema
});

export type CreateIdeaInput = z.infer<typeof createIdeaInputSchema>;

// Input schema for updating ideas
export const updateIdeaInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  category: ideaCategorySchema.optional()
});

export type UpdateIdeaInput = z.infer<typeof updateIdeaInputSchema>;

// Input schema for filtering ideas by category
export const filterIdeasInputSchema = z.object({
  category: ideaCategorySchema.optional()
});

export type FilterIdeasInput = z.infer<typeof filterIdeasInputSchema>;

// Input schema for deleting ideas
export const deleteIdeaInputSchema = z.object({
  id: z.number()
});

export type DeleteIdeaInput = z.infer<typeof deleteIdeaInputSchema>;
