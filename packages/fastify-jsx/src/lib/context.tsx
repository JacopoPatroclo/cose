// inspired by https://github.com/ethanniser/the-beth-stack/blob/main/packages/beth-stack/src/jsx/context.tsx

// DANGER! This implementation is not async safe. The context could be polluted when multiple requests are handled at the same time.
// and they perform async operations. This is a known issue and will not be fixed.
// see the readme for more details.

import type { Children } from '@kitajs/html';

class GlobalContextContext {
  private stack = new Array<symbol>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private map = new Map<symbol, any>();

  public set<T>(context: Context<T>, value: T) {
    this.map.set(context.id, value);
  }

  public get<T>(context: Context<T>): T | null {
    return this.map.get(context.id) ?? null;
  }

  public push(id: symbol) {
    this.stack.push(id);
  }

  public pop() {
    const id = this.stack.pop();
    if (!id) {
      throw new Error('Context stack is empty');
    }
    this.map.delete(id);
  }
}

export const GLOBAL_CONTEXT_CONTEXT = new GlobalContextContext();

class Context<T> {
  readonly id = Symbol('context');

  public Provider = ({
    children,
    value,
  }: {
    children: (value: T) => Children;
    value: T;
    safe?: boolean;
  }) => {
    GLOBAL_CONTEXT_CONTEXT.push(this.id);
    GLOBAL_CONTEXT_CONTEXT.set(this, value);

    const result = children(value);

    GLOBAL_CONTEXT_CONTEXT.pop();

    return <>{result}</>;
  };
}

export function defineContext<T>(): Context<T> {
  return new Context<T>();
}

export function consumeContext<T>(context: Context<T>): T | null {
  return GLOBAL_CONTEXT_CONTEXT.get(context);
}
