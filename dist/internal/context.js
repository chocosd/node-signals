export let activeObserver = null;
export function setActiveObserver(observer) {
    activeObserver = observer;
}
/** Run `fn` with no active observer so signal reads inside are not tracked. */
export function untracked(fn) {
    const prev = activeObserver;
    setActiveObserver(null);
    try {
        return fn();
    }
    finally {
        setActiveObserver(prev);
    }
}
/** Subscribe the currently running observer (if any) to a dependency. */
export function track(dep) {
    const observer = activeObserver;
    if (observer && !observer.deps.has(dep)) {
        observer.deps.add(dep);
        dep.observers.add(observer);
    }
}
/** Detach an observer from every dependency it currently reads. */
export function clearDeps(observer) {
    for (const dep of observer.deps) {
        dep.observers.delete(observer);
    }
    observer.deps.clear();
}
