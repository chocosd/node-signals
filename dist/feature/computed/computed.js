import { createEffect } from "../effect/effect.js";
import { signal } from "../signal/signal.js";
export function computed(fn) {
    const derived = signal(undefined);
    createEffect(() => {
        derived.set(fn());
    });
    return derived;
}
