import { notify } from "../../internal/batch.js";
import {
  activeObserver,
  clearDeps,
  setActiveObserver,
  track,
} from "../../internal/context.js";
import { createToMethod } from "../signal/signal.js";
import type { Dependency, Observer, Signal } from "../../types.js";

const READONLY = () => {
  throw new Error("computed signals are read-only");
};

/**
 * A lazy, memoized derived signal.
 *
 * The body runs on demand (first read, or after a dependency changes) rather
 * than eagerly, so dependencies are re-tracked every recompute. That means a
 * computed picks up sources that did not exist when it was first created.
 */
export function computed<T>(fn: () => T): Signal<T> {
  let value: T = undefined as T;
  let dirty = true;

  const node: Observer & Dependency = {
    deps: new Set(),
    observers: new Set(),

    markDirty() {
      if (dirty) {
        return;
      }

      dirty = true;
      // Propagate staleness downstream before any effect runs.
      notify(node.observers);
    },
  };

  function recompute(): void {
    clearDeps(node);

    const prev = activeObserver;
    setActiveObserver(node);

    try {
      value = fn();
    } finally {
      setActiveObserver(prev);
    }

    dirty = false;
  }

  const getter = (() => {
    if (dirty) {
      recompute();
    }

    track(node);
    return value;
  }) as Signal<T>;

  getter.set = READONLY;
  getter.update = READONLY;
  getter.to = createToMethod(getter);

  return getter;
}
