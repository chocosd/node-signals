import { createEffect } from "../effect/effect.js";
import { notify } from "../../internal/batch.js";
import { track } from "../../internal/context.js";
import { isThenable } from "../../internal/promise.js";
function chainTransform(source, transform) {
    const derived = signal(undefined);
    createEffect(() => {
        let cancelled = false;
        // Track upstream synchronously so async transforms re-run when source changes,
        // even if the transform only reads the signal inside a callback or Promise.
        source();
        const result = transform(source);
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
export function createToMethod(source) {
    function to(fn1, fn2, fn3, fn4, fn5) {
        const step1 = chainTransform(source, fn1);
        if (fn2 === undefined)
            return step1;
        const step2 = chainTransform(step1, fn2);
        if (fn3 === undefined)
            return step2;
        const step3 = chainTransform(step2, fn3);
        if (fn4 === undefined)
            return step3;
        const step4 = chainTransform(step3, fn4);
        if (fn5 === undefined)
            return step4;
        return chainTransform(step4, fn5);
    }
    return to;
}
export function signal(initial) {
    let value = initial;
    const dep = { observers: new Set() };
    const getter = (() => {
        track(dep);
        return value;
    });
    getter.set = (newValue) => {
        // Auto-memoize: an unchanged value never notifies observers.
        if (Object.is(value, newValue))
            return;
        value = newValue;
        notify(dep.observers);
    };
    getter.update = (updater) => {
        getter.set(updater(value));
    };
    getter.to = createToMethod(getter);
    return getter;
}
