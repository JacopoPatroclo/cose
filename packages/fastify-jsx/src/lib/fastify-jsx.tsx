import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest } from 'fastify';
import {
  Suspense as HtmlSuspense,
  renderToStream,
} from '@kitajs/html/suspense';
import { consumeContext, defineContext } from './context';

const MainRenderingContext = defineContext<{
  rid: number;
  fastify: FastifyInstance;
  request: FastifyRequest;
}>();

export function consumeFastify() {
  return consumeContext(MainRenderingContext).fastify;
}

export function consumeRequest() {
  return consumeContext(MainRenderingContext).request;
}

export function Suspense({
  children,
  ...props
}: Omit<Parameters<typeof HtmlSuspense>[0], 'rid'>) {
  const { rid } = consumeContext(MainRenderingContext);
  return (
    <HtmlSuspense rid={rid} {...props}>
      {children}
    </HtmlSuspense>
  );
}

declare module 'fastify' {
  interface FastifyReply {
    render: <T extends JSX.Element>(lazyHtml: () => T) => FastifyReply;
  }
}

export const fastifyJsxPlugin = fp(
  async function (fastify: FastifyInstance) {
    fastify.decorateReply('render', function (component) {
      const stream = renderToStream((rid) => (
        <MainRenderingContext.Provider
          value={{
            rid,
            fastify,
            request: this.request,
          }}
          safe
        >
          {component}
        </MainRenderingContext.Provider>
      ));

      return this.type('text/html; charset=utf-8').send(stream);
    });
  },
  {
    name: 'fastify-jsx',
  },
);
