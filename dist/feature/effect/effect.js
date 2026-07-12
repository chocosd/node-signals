import { scheduleEffect } from "../../internal/batch.js";
import { activeObserver, clearDeps, setActiveObserver, } from "../../internal/context.js";
export function createEffect(fn) {
    const effect = {
        active: true,
        deps: new Set(),
        cleanup: undefined,
        markDirty() {
            scheduleEffect(effect);
        },
        run() {
            if (!effect.active) {
                return;
            }
            // Re-track dependencies from scratch each run so stale reads are dropped.
            clearDeps(effect);
            const prev = activeObserver;
            setActiveObserver(effect);
            try {
                effect.cleanup?.();
                const result = fn();
                effect.cleanup = typeof result === "function" ? result : undefined;
            }
            finally {
                setActiveObserver(prev);
            }
        },
    };
    effect.run();
    return () => {
        if (!effect.active) {
            return;
        }
        effect.active = false;
        clearDeps(effect);
        effect.cleanup?.();
        effect.cleanup = undefined;
    };
}
