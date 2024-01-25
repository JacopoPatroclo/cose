import '@kitajs/html/register';
import '@kitajs/html/htmx';

import { FastifyInstance } from 'fastify';
import kitaHtmlPlugin from '@kitajs/fastify-html-plugin';

import type { env } from '@env';
import type { DBType } from '@drizzle';

import { exampleModule } from './modules/example-module';

export interface BuilderOptions {
  env: typeof env;
  db: DBType;
}

export default async function builder(
  fastify: FastifyInstance,
  options: BuilderOptions,
) {
  await fastify.register(kitaHtmlPlugin);
  await fastify.register(exampleModule, options);
}
