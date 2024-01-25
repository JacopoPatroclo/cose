import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { DBType } from '@drizzle';
import { exampleTable } from '@tables';
import { Home } from './pages';

export interface ExampleModuleOptions {
  db: DBType;
}

export const exampleModule: FastifyPluginAsyncTypebox<
  ExampleModuleOptions
> = async (fastify, opts) => {
  fastify.get('/', async (request, reply) => {
    const examples = await opts.db.select().from(exampleTable);
    return reply.html(<Home examples={examples} />);
  });
};
