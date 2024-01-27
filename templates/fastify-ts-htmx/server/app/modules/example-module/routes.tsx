import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { DBType } from '@drizzle';
import { Home } from './pages';

export interface ExampleModuleOptions {
  db: DBType;
}

export const exampleModule: FastifyPluginAsyncTypebox<
  ExampleModuleOptions
> = async (fastify, opts) => {
  const magicButton = (
    <button hx-get="/magic" hx-swap="outerHTML">
      Htmx magic button
    </button>
  );

  fastify.get('/', async (request, reply) => {
    if (request.headers['hx-request'] === 'true') {
      return reply.html(magicButton);
    }
    return reply.html(<Home>{magicButton}</Home>);
  });

  fastify.get('/magic', async (request, reply) => {
    return reply.html(
      <button hx-get="/" hx-swap="outerHTML">
        Look at that
      </button>,
    );
  });
};
