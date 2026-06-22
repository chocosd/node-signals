// src/internal/context.ts
var activeEffect = null;
function setActiveEffect(effect) {
  activeEffect = effect;
}

// src/feature/effect/effect.ts
function createEffect(fn) {
  const effect = (() => {
    if (!effect.active) return;
    const prev = activeEffect;
    setActiveEffect(effect);
    try {
      effect.cleanup?.();
      const result = fn();
      effect.cleanup = typeof result === "function" ? result : void 0;
    } finally {
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
    effect.cleanup = void 0;
  };
}

// src/feature/signal/signal.ts
function computed(fn) {
  const derived = signal(fn());
  createEffect(() => {
    derived.set(fn());
  });
  return derived;
}
function chainTransform(source, transform) {
  return computed(() => transform(source));
}
function createToMethod(source) {
  function to(fn1, fn2, fn3, fn4, fn5) {
    const step1 = chainTransform(source, fn1);
    if (fn2 === void 0) return step1;
    const step2 = chainTransform(step1, fn2);
    if (fn3 === void 0) return step2;
    const step3 = chainTransform(step2, fn3);
    if (fn4 === void 0) return step3;
    const step4 = chainTransform(step3, fn4);
    if (fn5 === void 0) return step4;
    return chainTransform(step4, fn5);
  }
  return to;
}
function signal(initial) {
  let value = initial;
  const subscribers = /* @__PURE__ */ new Set();
  const getter = (() => {
    if (activeEffect) {
      subscribers.add(activeEffect);
    }
    return value;
  });
  getter.set = (newValue) => {
    if (Object.is(value, newValue)) return;
    value = newValue;
    subscribers.forEach((effect) => {
      if (effect.active) {
        effect();
      }
    });
  };
  getter.update = (updater) => {
    getter.set(updater(value));
  };
  getter.to = createToMethod(getter);
  return getter;
}

export { createEffect, signal };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map