import { createEffect } from "../effect/effect";
import { signal } from "../signal/signal";
import type { Signal } from "../../types";

export function computed<T>(fn: () => T): Signal<T> {
  const derived = signal(undefined as T);

  createEffect(() => {
    derived.set(fn());
  });

  return derived;
}
