import { activeEffect, setActiveEffect } from "../../internal/context.js";
export function createEffect(fn) {
    const effect = (() => {
        if (!effect.active)
            return;
        const prev = activeEffect;
        setActiveEffect(effect);
        try {
            effect.cleanup?.();
            const result = fn();
            effect.cleanup = typeof result === "function" ? result : undefined;
        }
        finally {
            setActiveEffect(prev);
        }
    });
    effect.active = true;
    effect();
    return () => {
        if (!effect.active) {
            return;
        }
        effect.active = false;
        effect.cleanup?.();
        effect.cleanup = undefined;
    };
}
