let batchDepth = 0;
const pendingEffects = new Set();
export function isBatching() {
    return batchDepth > 0;
}
export function scheduleEffect(effect) {
    if (batchDepth > 0) {
        pendingEffects.add(effect);
        return;
    }
    if (effect.active) {
        effect();
    }
}
export function batch(fn) {
    batchDepth += 1;
    try {
        fn();
    }
    finally {
        batchDepth -= 1;
        if (batchDepth === 0) {
            const effects = [...pendingEffects];
            pendingEffects.clear();
            for (const effect of effects) {
                if (effect.active) {
                    effect();
                }
            }
        }
    }
}
