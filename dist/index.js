var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/internal/batch.ts
var batchDepth = 0;
var pendingEffects = /* @__PURE__ */ new Set();
function scheduleEffect(effect) {
  if (batchDepth > 0) {
    pendingEffects.add(effect);
    return;
  }
  if (effect.active) {
    effect();
  }
}
function batch(fn) {
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

// src/feature/batch/batch.ts
function batch2(fn) {
  batch(fn);
}

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

// src/internal/promise.ts
function isThenable(value) {
  return typeof value === "object" && value !== null && "then" in value && typeof value.then === "function";
}

// src/feature/signal/signal.ts
function chainTransform(source, transform) {
  const derived = signal(void 0);
  createEffect(() => {
    let cancelled = false;
    source();
    const result = transform(source);
    if (isThenable(result)) {
      void Promise.resolve(result).then((value) => {
        if (!cancelled) {
          derived.set(value);
        }
      });
      return () => {
        cancelled = true;
      };
    }
    derived.set(result);
  });
  return derived;
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
      scheduleEffect(effect);
    });
  };
  getter.update = (updater) => {
    getter.set(updater(value));
  };
  getter.to = createToMethod(getter);
  return getter;
}

// src/feature/computed/computed.ts
function computed(fn) {
  const derived = signal(void 0);
  createEffect(() => {
    derived.set(fn());
  });
  return derived;
}

// src/feature/from/from.ts
function from(factory) {
  const derived = signal(void 0);
  if (isEmitFactory(factory)) {
    createEffect(() => factory((value) => derived.set(value)));
    return derived;
  }
  const valueFactory = factory;
  createEffect(() => {
    let cancelled = false;
    const result = valueFactory();
    if (isThenable(result)) {
      void Promise.resolve(result).then((value) => {
        if (!cancelled) {
          derived.set(value);
        }
      });
      return () => {
        cancelled = true;
      };
    }
    derived.set(result);
  });
  return derived;
}
function isEmitFactory(factory) {
  return factory.length === 1;
}

// src/feature/fromHttp/fromHttp.ts
function fromHttp(url, options) {
  const data = signal(void 0);
  const loading = signal(false);
  const error = signal(void 0);
  createEffect(() => {
    let cancelled = false;
    loading.set(true);
    error.set(void 0);
    const params = options?.params?.();
    const requestUrl = buildUrl(url, params);
    void fetch(requestUrl).then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${requestUrl}`);
      }
      return response.json();
    }).then((result) => {
      if (!cancelled) {
        data.set(result);
        loading.set(false);
      }
    }).catch((err) => {
      if (!cancelled) {
        error.set(err instanceof Error ? err : new Error(String(err)));
        loading.set(false);
      }
    });
    return () => {
      cancelled = true;
    };
  });
  return { data, loading, error };
}
function buildUrl(url, params) {
  if (!params) {
    return url;
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== void 0 && value !== null) {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  if (!query) {
    return url;
  }
  return url.includes("?") ? `${url}&${query}` : `${url}?${query}`;
}

// src/feature/operators/map.ts
function map(fn) {
  return (src) => fn(src());
}

// src/feature/operators/debug.ts
function debug(label = "debug") {
  return (src) => {
    const value = src();
    console.log(label, value);
    return value;
  };
}

// src/feature/operators/distinctUntilChanged.ts
function distinctUntilChanged(equals = Object.is) {
  let previous;
  let hasPrevious = false;
  return (src) => {
    const value = src();
    if (hasPrevious && equals(previous, value)) {
      return previous;
    }
    previous = value;
    hasPrevious = true;
    return value;
  };
}

// src/feature/operators/debounceTime.ts
function debounceTime(ms) {
  return (src) => new Promise((resolve) => {
    setTimeout(() => resolve(src()), ms);
  });
}

// src/feature/operators/throttleTime.ts
function throttleTime(ms) {
  let lastEmit = 0;
  return (src) => {
    const value = src();
    const now = Date.now();
    const elapsed = now - lastEmit;
    if (elapsed >= ms || lastEmit === 0) {
      lastEmit = now;
      return value;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        lastEmit = Date.now();
        resolve(src());
      }, ms - elapsed);
    });
  };
}

// src/feature/render/fragment.ts
var Fragment = class {
  constructor() {
    __publicField(this, "cleanups", []);
    __publicField(this, "keyedElements", /* @__PURE__ */ new Map());
  }
  createElement(tag, key) {
    if (key !== void 0) {
      const existing = this.keyedElements.get(key);
      if (existing) {
        return existing;
      }
      const element = document.createElement(tag);
      this.keyedElements.set(key, element);
      return element;
    }
    return document.createElement(tag);
  }
  onCleanup(fn) {
    this.cleanups.push(fn);
  }
  runCleanup() {
    for (const fn of this.cleanups) {
      fn();
    }
    this.cleanups = [];
  }
};

// src/feature/render/render.ts
function render(container, view) {
  const target = typeof container === "string" ? document.querySelector(container) : container;
  if (!target) {
    throw new Error(`render target not found: ${String(container)}`);
  }
  const frag = new Fragment();
  let mountedRoot = null;
  const dispose = createEffect(() => {
    const result = view(frag);
    if (mountedRoot !== result) {
      target.replaceChildren(result);
      mountedRoot = result;
    }
    return () => {
      frag.runCleanup();
    };
  });
  return () => {
    dispose();
    target.replaceChildren();
    mountedRoot = null;
  };
}

export { Fragment, batch2 as batch, computed, createEffect, debounceTime, debug, distinctUntilChanged, from, fromHttp, map, render, signal, throttleTime };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map