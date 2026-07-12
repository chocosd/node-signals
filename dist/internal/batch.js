let batchDepth = 0;
const pending = new Set();
export function isBatching() {
    return batchDepth > 0;
}
export function startBatch() {
    batchDepth += 1;
}
export function endBatch() {
    batchDepth -= 1;
    if (batchDepth === 0) {
        flush();
    }
}
/** Queue an effect to run once the current mark phase settles. */
export function scheduleEffect(effect) {
    pending.add(effect);
}
function flush() {
    // Guard against re-entrant flushes while effects trigger further updates.
    batchDepth += 1;
    try {
        while (pending.size > 0) {
            const effects = [...pending];
            pending.clear();
            for (const effect of effects) {
                if (effect.active) {
                    effect.run();
                }
            }
        }
    }
    finally {
        batchDepth -= 1;
    }
}
/**
 * Mark every observer of a changed source dirty inside a batch boundary, so
 * computeds are all flagged before any effect runs (no glitches / double runs).
 */
export function notify(observers) {
    startBatch();
    try {
        for (const observer of [...observers]) {
            observer.markDirty();
        }
    }
    finally {
        endBatch();
    }
}
export function batch(fn) {
    startBatch();
    try {
        fn();
    }
    finally {
        endBatch();
    }
}
