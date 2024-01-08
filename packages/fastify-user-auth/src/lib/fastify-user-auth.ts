import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from 'fastify';
import type { PgDatabase, QueryResultHKT } from 'drizzle-orm/pg-core';
import { Type, type TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { UsernamePasswordSaltPGGenericTableType } from './drizzle-partials';
import { AuthService, UserService } from './services';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    fastifyUserAuth: {
      userService: UserService;
      verifyCookie?: preHandlerAsyncHookHandler;
      verifyHeader?: preHandlerAsyncHookHandler;
    };
  }

  interface FastifyRequest {
    username?: string;
  }
}

interface PluginFlags {
  createUser?: boolean;
}

export interface FastifyUserAuthOptions {
  drizzle: PgDatabase<QueryResultHKT>;
  tables: {
    usersTable: UsernamePasswordSaltPGGenericTableType;
  };
  options:
    | {
        flags?: PluginFlags;
        transport: 'header';
        jwt_secret: string;
      }
    | {
        flags?: PluginFlags;
        transport: 'cookie';
        cookie_secret: string;
        cookie_name: string;
        jwt_secret: string;
      };
}

async function fastifyUserAuth(
  f: FastifyInstance,
  options: FastifyUserAuthOptions,
) {
  const typedFastifyInstance = f.withTypeProvider<TypeBoxTypeProvider>();
  const authService = new AuthService(
    options.drizzle,
    options.tables.usersTable,
    options.options.jwt_secret,
  );

  const userService = new UserService(
    options.drizzle,
    options.tables.usersTable,
    authService,
  );

  if (options.options.transport === 'cookie') {
    await typedFastifyInstance.register(await import('@fastify/cookie'), {
      secret: options.options.cookie_secret,
    });

    const cookie_name = options.options.cookie_name;
    const verifyCookie: preHandlerAsyncHookHandler = async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      const authToken = request.cookies[cookie_name];
      try {
        const tokenValidPayload = await authService.checkAuthToken(authToken);
        request.username = tokenValidPayload.username;
        return;
      } catch (e) {
        reply.status(401);
        return;
      }
    };

    typedFastifyInstance.decorate('fastifyUserAuth', {
      userService,
      verifyCookie,
    });
  }
  if (options.options.transport === 'header') {
    const verifyHeader: preHandlerAsyncHookHandler = async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      const authorizationHeader = request.headers['authorization'];
      const authToken = authorizationHeader?.split('Bearer ')[1];
      try {
        const tokenValidPayload = await authService.checkAuthToken(authToken);
        request.username = tokenValidPayload.username;
        return;
      } catch (e) {
        reply.status(401);
        return;
      }
    };

    typedFastifyInstance.decorate('fastifyUserAuth', {
      userService,
      verifyHeader,
    });
  }

  if (options.options.flags?.createUser) {
    typedFastifyInstance.post(
      '/create',
      {
        schema: {
          body: Type.Object({
            username: Type.String(),
            password: Type.String(),
          }),
          response: {
            200: Type.Object({
              username: Type.String(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { username, password } = request.body;
        const user = await userService.createUser(username, password);
        reply.send(user);
      },
    );
  }

  typedFastifyInstance.post(
    '/login',
    {
      schema: {
        body: Type.Object({
          username: Type.String(),
          password: Type.String(),
        }),
        response: {
          200: Type.Object({
            username: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { username, password } = request.body;
      const canLogin = await authService.canLogin(username, password);
      if (!canLogin) {
        reply.status(401).send();
        return;
      }
      if (options.options.transport === 'cookie') {
        const authToken = await authService.createAuthToken(username);
        reply.setCookie(options.options.cookie_name, authToken);
        return reply.send({ username });
      }
      if (options.options.transport === 'header') {
        const authToken = await authService.createAuthToken(username);
        reply.header('Authorization', `Bearer ${authToken}`);
        return reply.send({ username });
      }
    },
  );

  typedFastifyInstance.post(
    '/logout',
    {
      preHandler:
        typedFastifyInstance.fastifyUserAuth?.verifyHeader ||
        typedFastifyInstance.fastifyUserAuth?.verifyCookie,
    },
    async (_, reply) => {
      if (options.options.transport === 'cookie')
        return reply
          .clearCookie(options.options.cookie_name)
          .status(200)
          .send();

      reply.status(200).send();
    },
  );
}

export const fastifyUserAuthPlugin = fp(fastifyUserAuth);
