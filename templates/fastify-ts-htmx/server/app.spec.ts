import { expect, test, beforeAll, vi, afterEach } from 'vitest';
import { makeFastifyApp } from '@mocks';

const { app, query } = makeFastifyApp({
  ENVIROMENT: 'test',
  DB_SSL: false,
  DB_URL: 'postgres://localhost:5432/postgres',
});

beforeAll(async () => {
  await app.ready();
});

afterEach(() => {
  vi.clearAllMocks();
});

test('Your first test', async () => {
  query.mockImplementationOnce(({ text }) => {
    expect(text).toContain('select "uuid"');
    return Promise.resolve({
      rows: [['123', 'matio@email.com']],
    });
  });

  const response = await app.inject({
    method: 'GET',
    url: '/',
  });

  expect(response.statusCode).toBe(200);
  expect(response.body).toContain('Hello World');
});
