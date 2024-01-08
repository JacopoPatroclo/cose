import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { fastifyUserAuthPlugin } from './fastify-user-auth';
import { makeUsernamePasswordSaltPG } from './drizzle-partials';
import fastify, { FastifyInstance } from 'fastify';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { Sql } from 'postgres';

const drizzleUserTable = pgTable('users_test', {
  user_uuid: uuid('user_uuid').primaryKey().defaultRandom(),
  ...makeUsernamePasswordSaltPG(),
});

const mockPostgresDriver = {
  unsafe: jest.fn(),
};

let fastifyInstance: FastifyInstance;

describe('fastifyUserAuth', () => {
  beforeAll(async () => {
    fastifyInstance = fastify();

    await fastifyInstance
      .register(fastifyUserAuthPlugin, {
        drizzle: drizzle(mockPostgresDriver as unknown as Sql),
        tables: {
          usersTable: drizzleUserTable,
        },
        options: {
          flags: {
            createUser: true,
          },
          transport: 'cookie',
          cookie_secret: 'supersecret',
          cookie_name: 'x-auth-cookie-name',
          jwt_secret: 'jwtsecret',
        },
      })
      .ready();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user', async () => {
    expect(fastifyInstance.fastifyUserAuth).toBeDefined();

    mockPostgresDriver.unsafe.mockImplementation((query) => {
      expect(query).toMatch(
        'insert into "users_test" ("user_uuid", "username", "password", "salt")',
      );
      return {
        values: () => [['testuser']],
      };
    });

    const response = await fastifyInstance.inject({
      method: 'POST',
      url: '/create',
      payload: {
        username: 'testuser',
        password: 'passwordrandom',
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual({
      username: 'testuser',
    });
  });

  it('should login a user', async () => {
    expect(fastifyInstance.fastifyUserAuth).toBeDefined();

    mockPostgresDriver.unsafe.mockImplementation((query) => {
      expect(query).toMatch('select "username", "password", "salt"');
      return {
        values: () => [
          [
            'testuser',
            // Hash of 'passwordrandom' with generated salt
            'f94679a260c8ca1f2509a64bdb6137254730d364d8d6289733caad1f4ec1f7f88e81594afa9ca413b68871fe6ef6717de24bc4968e38e93de108211f41e81f86',
            '0542a38e7af90066cfabf3cedb443bdb37e1e345e6a58e4ec887af5cfbb4e46aa05951222c45b95d0d144591d247bcb1f5bd3e4b3ade21e36183ea24907be0ca',
          ],
        ],
      };
    });

    const response = await fastifyInstance.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'testuser',
        password: 'passwordrandom',
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(response.headers['set-cookie']).toMatch('x-auth-cookie-nam');
  });
});
