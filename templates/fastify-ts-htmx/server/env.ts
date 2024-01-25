import envSchema from 'env-schema';
import { Static, Type } from '@sinclair/typebox';
import dotenvflow from 'dotenv-flow';

dotenvflow.config();

const schema = Type.Object({
  ENVIROMENT: Type.Union(
    [
      Type.Literal('development'),
      Type.Literal('production'),
      Type.Literal('test'),
    ],
    { default: 'development' },
  ),
  DB_URL: Type.String(),
  DB_SSL: Type.Boolean(),
});

export const env = envSchema<Static<typeof schema>>({
  schema: schema,
  data: process.env,
  expandEnv: true,
});
