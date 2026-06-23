import type { Effect } from "../types";

let batchDepth = 0;
const pendingEffects = new Set<Effect>();

export function isBatching(): boolean {
  return batchDepth > 0;
}

export function scheduleEffect(effect: Effect): void {
  if (batchDepth > 0) {
    pendingEffects.add(effect);
    return;
  }

  if (effect.active) {
    effect();
  }
}

export function batch(fn: () => void): void {
  batchDepth += 1;

  try {
    fn();
  } finally {
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
