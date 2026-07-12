import type { Effect, Observer } from "../types.js";

let batchDepth = 0;
const pending = new Set<Effect>();

export function isBatching(): boolean {
  return batchDepth > 0;
}

export function startBatch(): void {
  batchDepth += 1;
}

export function endBatch(): void {
  batchDepth -= 1;

  if (batchDepth === 0) {
    flush();
  }
}

/** Queue an effect to run once the current mark phase settles. */
export function scheduleEffect(effect: Effect): void {
  pending.add(effect);
}

function flush(): void {
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
  } finally {
    batchDepth -= 1;
  }
}

/**
 * Mark every observer of a changed source dirty inside a batch boundary, so
 * computeds are all flagged before any effect runs (no glitches / double runs).
 */
export function notify(observers: Set<Observer>): void {
  startBatch();

  try {
    for (const observer of [...observers]) {
      observer.markDirty();
    }
  } finally {
    endBatch();
  }
}

export function batch(fn: () => void): void {
  startBatch();

  try {
    fn();
  } finally {
    endBatch();
  }
}
