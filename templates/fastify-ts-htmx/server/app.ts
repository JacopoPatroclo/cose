import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import closeWithGrace from 'close-with-grace';

import { env } from '@env';
import { doMigrate, makeDrizzle, pool } from '@drizzle';
import builder from './app/builder';

const pino = {
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
};

const app = fastify({
  logger: env.ENVIROMENT === 'production' ? true : pino,
});

app.register(fastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/public/',
  cacheControl: false,
});

const db = makeDrizzle(pool);
app.register(builder, { env, db });

app
  .ready()
  .then(() =>
    doMigrate(db, { migrationsFolder: join(__dirname, 'migrations') }),
  )
  .then(() => app.listen({ port: 3000, host: '0.0.0.0' }))
  .then(() => {
    app.log.info('Server listening on port 3000');
  });

closeWithGrace({ delay: 500 }, async function ({ err }) {
  if (err) {
    app.log.error(err, 'app closing due to error');
  }
  await app.close();
});
