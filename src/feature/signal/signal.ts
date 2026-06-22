import { createEffect } from "../effect/effect";
import { activeEffect } from "../../internal/context";
import type { Effect, Signal } from "../../types";

function computed<T>(fn: () => T): Signal<T> {
  const derived = signal(fn());

  createEffect(() => {
    derived.set(fn());
  });

  return derived;
}

function chainTransform<I, O>(
  source: Signal<I>,
  transform: (src: Signal<I>) => O,
): Signal<O> {
  return computed(() => transform(source));
}

function createToMethod<T>(source: Signal<T>): Signal<T>["to"] {
  function to<A>(fn: (src: Signal<T>) => A): Signal<A>;
  function to<A, B>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<A>) => B,
  ): Signal<B>;
  function to<A, B, C>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<A>) => B,
    fn3: (src: Signal<B>) => C,
  ): Signal<C>;
  function to<A, B, C, D>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<A>) => B,
    fn3: (src: Signal<B>) => C,
    fn4: (src: Signal<C>) => D,
  ): Signal<D>;
  function to<A, B, C, D, E>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<A>) => B,
    fn3: (src: Signal<B>) => C,
    fn4: (src: Signal<C>) => D,
    fn5: (src: Signal<D>) => E,
  ): Signal<E>;
  function to<A, B = A, C = B, D = C, E = D>(
    fn1: (src: Signal<T>) => A,
    fn2?: (src: Signal<A>) => B,
    fn3?: (src: Signal<B>) => C,
    fn4?: (src: Signal<C>) => D,
    fn5?: (src: Signal<D>) => E,
  ): Signal<A | B | C | D | E> {
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
  const subscribers = new Set<Effect>();

  const getter = (() => {
    if (activeEffect) {
      subscribers.add(activeEffect);
    }
    return value;
  }) as Signal<T>;

  getter.set = (newValue: T) => {
    if (Object.is(value, newValue)) return;

    value = newValue;

    subscribers.forEach((effect) => {
      if (effect.active) {
        effect();
      }
    });
  };

  getter.update = (updater: (prev: T) => T) => {
    getter.set(updater(value));
  };

  getter.to = createToMethod(getter);

  return getter;
}
