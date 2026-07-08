import { createEffect } from "../effect/effect.js";
import { signal } from "../signal/signal.js";
import type { Signal } from "../../types.js";

export function computed<T>(fn: () => T): Signal<T> {
  const derived = signal(undefined as T);

  createEffect(() => {
    derived.set(fn());
  });

  return derived;
}
