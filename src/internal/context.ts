import type { Dependency, Observer } from "../types.js";

export let activeObserver: Observer | null = null;

export function setActiveObserver(observer: Observer | null): void {
  activeObserver = observer;
}

/** Run `fn` with no active observer so signal reads inside are not tracked. */
export function untracked<T>(fn: () => T): T {
  const prev = activeObserver;
  setActiveObserver(null);

  try {
    return fn();
  } finally {
    setActiveObserver(prev);
  }
}

/** Subscribe the currently running observer (if any) to a dependency. */
export function track(dep: Dependency): void {
  const observer = activeObserver;

  if (observer && !observer.deps.has(dep)) {
    observer.deps.add(dep);
    dep.observers.add(observer);
  }
}

/** Detach an observer from every dependency it currently reads. */
export function clearDeps(observer: Observer): void {
  for (const dep of observer.deps) {
    dep.observers.delete(observer);
  }

  observer.deps.clear();
}
