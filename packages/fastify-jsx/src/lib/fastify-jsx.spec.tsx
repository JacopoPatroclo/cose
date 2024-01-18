import '@kitajs/html/register';
import Fastify, { FastifyInstance } from 'fastify';
import {
  Suspense,
  consumeFastify,
  consumeRequest,
  fastifyJsxPlugin,
} from './fastify-jsx';

describe('fastify-jsx main feature', () => {
  let server: FastifyInstance;

  beforeEach(() => {
    server = Fastify();
    server.register(fastifyJsxPlugin);
  });

  it('should respond with some html', async () => {
    server.get('/', async (request, reply) => {
      await reply.render(() => <div>Hello World</div>);
    });

    const response = await server.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.headers['content-type']).toEqual(
      'text/html; charset=utf-8',
    );
    expect(response.body).toEqual('<div>Hello World</div>');
  });

  it('the consumeRequest should work', async () => {
    function Component() {
      const request = consumeRequest();
      return <div>{request.url}</div>;
    }
    server.get('/hello', async (request, reply) => {
      await reply.render(() => <Component />);
    });

    const response = await server.inject({
      method: 'GET',
      url: '/hello',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('<div>/hello</div>');
  });

  it('the consumeFastify should work', async () => {
    server.decorate('hello', 'world');

    function Component() {
      const fastify = consumeFastify();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <div>{(fastify as unknown as any).hello}</div>;
    }
    server.get('/hello', async (request, reply) => {
      await reply.render(() => <Component />);
    });

    const response = await server.inject({
      method: 'GET',
      url: '/hello',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual('<div>world</div>');
  });

  it('should handle async components', async () => {
    function wait(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function Wait(props: { ms: number }) {
      await wait(props.ms);
      return <div>Waited {props.ms}</div>;
    }

    server.get('/hello', async (request, reply) => {
      await reply.render(() => (
        <div>
          Suspense page
          <Suspense fallback={<div>Loading 1000ms</div>}>
            <Wait ms={100} />
          </Suspense>
          <Suspense fallback={<div>Loading 2000ms</div>}>
            <Wait ms={200} />
          </Suspense>
        </div>
      ));
    });

    const response = await server.inject({
      method: 'GET',
      url: '/hello',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toContain('Suspense page');
    expect(response.body).toContain('Loading 1000ms');
    expect(response.body).toContain('Loading 2000ms');
  });
});
