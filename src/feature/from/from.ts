import { createEffect } from "../effect/effect";
import { isThenable } from "../../internal/promise";
import { signal } from "../signal/signal";
import type { Cleanup, Signal } from "../../types";

type EmitFactory<T> = (emit: (value: T) => void) => Cleanup;
type ValueFactory<T> = () => T | Promise<T>;

export function from<T>(factory: ValueFactory<T>): Signal<T | undefined>;
export function from<T>(factory: EmitFactory<T>): Signal<T | undefined>;
export function from<T>(
  factory: ValueFactory<T> | EmitFactory<T>,
): Signal<T | undefined> {
  const derived = signal<T | undefined>(undefined);

  if (isEmitFactory(factory)) {
    createEffect(() => factory((value) => derived.set(value)));
    return derived;
  }

  const valueFactory = factory as ValueFactory<T>;

  createEffect(() => {
    let cancelled = false;
    const result = valueFactory();

    if (isThenable(result)) {
      void Promise.resolve(result).then((value) => {
        if (!cancelled) {
          derived.set(value);
        }
      });

      return () => {
        cancelled = true;
      };
    }

    derived.set(result);
  });

  return derived;
}

function isEmitFactory<T>(
  factory: ValueFactory<T> | EmitFactory<T>,
): factory is EmitFactory<T> {
  return factory.length === 1;
}
