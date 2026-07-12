import { createEffect } from "../effect/effect.js";
import { notify } from "../../internal/batch.js";
import { track } from "../../internal/context.js";
import { isThenable } from "../../internal/promise.js";
import type { Dependency, Resolved, Signal } from "../../types.js";

function chainTransform<I, O>(
  source: Signal<I>,
  transform: (src: Signal<I>) => O | Promise<O>,
): Signal<Resolved<O>> {
  const derived = signal(undefined as Resolved<O>);

  createEffect(() => {
    let cancelled = false;

    // Track upstream synchronously so async transforms re-run when source changes,
    // even if the transform only reads the signal inside a callback or Promise.
    source();

    const result = transform(source);

    if (isThenable<O>(result)) {
      void Promise.resolve(result).then((value) => {
        if (!cancelled) {
          derived.set(value as Resolved<O>);
        }
      });

      return () => {
        cancelled = true;
      };
    }

    derived.set(result as Resolved<O>);
  });

  return derived;
}

export function createToMethod<T>(source: Signal<T>): Signal<T>["to"] {
  function to<A>(fn: (src: Signal<T>) => A): Signal<Resolved<A>>;
  function to<A, B>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<Resolved<A>>) => B,
  ): Signal<Resolved<B>>;
  function to<A, B, C>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<Resolved<A>>) => B,
    fn3: (src: Signal<Resolved<B>>) => C,
  ): Signal<Resolved<C>>;
  function to<A, B, C, D>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<Resolved<A>>) => B,
    fn3: (src: Signal<Resolved<B>>) => C,
    fn4: (src: Signal<Resolved<C>>) => D,
  ): Signal<Resolved<D>>;
  function to<A, B, C, D, E>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<Resolved<A>>) => B,
    fn3: (src: Signal<Resolved<B>>) => C,
    fn4: (src: Signal<Resolved<C>>) => D,
    fn5: (src: Signal<Resolved<D>>) => E,
  ): Signal<Resolved<E>>;
  function to<A, B = A, C = B, D = C, E = D>(
    fn1: (src: Signal<T>) => A,
    fn2?: (src: Signal<Resolved<A>>) => B,
    fn3?: (src: Signal<Resolved<B>>) => C,
    fn4?: (src: Signal<Resolved<C>>) => D,
    fn5?: (src: Signal<Resolved<D>>) => E,
  ): Signal<Resolved<A | B | C | D | E>> {
    const step1 = chainTransform(source, fn1);
    if (fn2 === undefined) return step1;

    const step2 = chainTransform(step1, fn2);
    if (fn3 === undefined) return step2;

    const step3 = chainTransform(step2, fn3);
    if (fn4 === undefined) return step3;

    const step4 = chainTransform(step3, fn4);
    if (fn5 === undefined) return step4;

    return chainTransform(step4, fn5);
  }

  return to;
}

export function signal<T>(initial: T): Signal<T> {
  let value = initial;
  const dep: Dependency = { observers: new Set() };

  const getter = (() => {
    track(dep);
    return value;
  }) as Signal<T>;

  getter.set = (newValue: T) => {
    // Auto-memoize: an unchanged value never notifies observers.
    if (Object.is(value, newValue)) return;

    value = newValue;
    notify(dep.observers);
  };

  getter.update = (updater: (prev: T) => T) => {
    getter.set(updater(value));
  };

  getter.to = createToMethod(getter);

  return getter;
}
