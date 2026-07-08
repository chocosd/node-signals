import { createEffect } from "../effect/effect.js";
import { isThenable } from "../../internal/promise.js";
import { signal } from "../signal/signal.js";
export function from(factory) {
    const derived = signal(undefined);
    if (isEmitFactory(factory)) {
        createEffect(() => factory((value) => derived.set(value)));
        return derived;
    }
    const valueFactory = factory;
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
function isEmitFactory(factory) {
    return factory.length === 1;
}
