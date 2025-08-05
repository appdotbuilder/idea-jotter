
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { 
  createIdeaInputSchema, 
  updateIdeaInputSchema, 
  filterIdeasInputSchema, 
  deleteIdeaInputSchema 
} from './schema';
import { createIdea } from './handlers/create_idea';
import { getIdeas } from './handlers/get_ideas';
import { updateIdea } from './handlers/update_idea';
import { deleteIdea } from './handlers/delete_idea';
import { getIdeaById } from './handlers/get_idea_by_id';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new idea
  createIdea: publicProcedure
    .input(createIdeaInputSchema)
    .mutation(({ input }) => createIdea(input)),
  
  // Get all ideas with optional category filter
  getIdeas: publicProcedure
    .input(filterIdeasInputSchema.optional())
    .query(({ input }) => getIdeas(input)),
  
  // Get a single idea by ID
  getIdeaById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getIdeaById(input.id)),
  
  // Update an existing idea
  updateIdea: publicProcedure
    .input(updateIdeaInputSchema)
    .mutation(({ input }) => updateIdea(input)),
  
  // Delete an idea
  deleteIdea: publicProcedure
    .input(deleteIdeaInputSchema)
    .mutation(({ input }) => deleteIdea(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
