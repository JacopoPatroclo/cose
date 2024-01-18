import '@kitajs/html/register';
export {
  isUpper,
  escapeHtml,
  isVoidElement,
  styleToString,
  attributesToString,
  toKebabCase,
  createElement,
  contentsToString,
  compile,
  Fragment,
  Children,
  PropsWithChildren,
  Component,
} from '@kitajs/html';
export { Suspense, consumeFastify, consumeRequest } from './lib/fastify-jsx';
export { defineContext, consumeContext } from './lib/context';

import { fastifyJsxPlugin } from './lib/fastify-jsx';
export default fastifyJsxPlugin;
