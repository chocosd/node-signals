type Effect = {
  (): void;
  active: boolean;
  cleanup?: Cleanup;
};

type Cleanup = () => void;

type EffectFn = () => void | Cleanup;

type Getter<T> = () => T;

type Transform<I, O> = (src: Getter<I>) => O;

/**
 * Recursively resolves the output type of a transform pipeline
 */
type PipeResult<T, Ts extends Transform<unknown, unknown>[]> = Ts extends [
  Transform<infer _I, infer O>,
  ...infer Rest,
]
  ? Rest extends Transform<unknown, unknown>[]
    ? PipeResult<O, Rest>
    : O
  : T;

let activeEffect: Effect | null = null;

export interface Signal<T> {
  (): T;
  set(v: T): void;
  update(updater: (prev: T) => T): void;

  to<Ts extends Transform<unknown, unknown>[]>(
    ...transforms: Ts
  ): Signal<PipeResult<T, Ts>>;
}

export function createEffect(fn: EffectFn): () => void {
  const effect: Effect = (() => {
    if (!effect.active) {
      return;
    }

    const prev = activeEffect;
    activeEffect = effect;

    try {
      // run previous cleanup before re-execution
      effect.cleanup?.();
      const result = fn();
      effect.cleanup = typeof result === "function" ? result : undefined;
    } finally {
      activeEffect = prev;
    }
  }) as Effect;

  effect.active = true;

  // initial run
  effect();

  // teardown / dispose
  return () => {
    if (!effect.active) {
      return;
    }

    effect.active = false;
    effect.cleanup?.();
    effect.cleanup = undefined;
  };
}

export function signal<T>(initial: T): Signal<T> {
  let value = initial;
  const subscribers = new Set<Effect>();

  const getter = (() => {
    if (activeEffect) {
      subscribers.add(activeEffect);
    }
    return value;
  }) as Signal<T>;

  getter.set = (newValue: T) => {
    if (Object.is(value, newValue)) {
      return;
    }

    value = newValue;
    [...subscribers].forEach((subscriber) => subscriber());
  };

  getter.update = (updater: (prev: T) => T) => {
    getter.set(updater(value));
  };

  getter.to = function <Ts extends Transform<unknown, unknown>[]>(
    ...transforms: Transform<unknown, unknown>[]
  ): Signal<PipeResult<T, Ts>> {
    return transforms.reduce(
      (prevSignal, transform) =>
        signal(transform(prevSignal as Getter<unknown>)),
      getter as Signal<unknown>,
    ) as Signal<PipeResult<T, Ts>>;
  };

  return getter;
}
