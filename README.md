# @chocosd/node-signals

A tiny reactive engine: signals, effects, computed, pipelines, operators, and async sources. Runs in **Node 18+** and the **browser**.

- **ESM only** — native ES modules with TypeScript declarations.
- **Runtime-agnostic core** — signals, effects, pipelines, and HTTP helpers work in Node and the browser.
- **Optional DOM layer** — `@chocosd/node-signals/dom` adds a lightweight `render()` for the browser.

## Install

```bash
npm install @chocosd/node-signals
```

Node 18+ is required for `fromHttp` (uses the built-in `fetch`).

## Quick start

```ts
import { signal, createEffect } from "@chocosd/node-signals";

const count = signal(0);

createEffect(() => {
  console.log("count:", count());
});

count.set(1);
```

## Signal

```ts
import { signal } from "@chocosd/node-signals";

const count = signal(0);

count();              // read
count.set(1);         // write
count.update((v) => v + 1);
```

## Effect

```ts
import { createEffect } from "@chocosd/node-signals";

createEffect(() => {
  console.log(count());
});
```

Return a cleanup function to tear down side effects:

```ts
const dispose = createEffect(() => {
  const id = setInterval(() => console.log(count()), 1000);
  return () => clearInterval(id);
});

dispose();
```

## untracked

Run a callback without subscribing the current effect or computed to signal reads inside it:

```ts
import { createEffect, untracked } from "@chocosd/node-signals";

function subscribeSignal(signalFn, listener) {
  let initialized = false;
  return createEffect(() => {
    signalFn(); // only dependency you want
    if (!initialized) {
      initialized = true;
      return;
    }
    untracked(() => listener()); // mounting/reads here don't widen deps
  });
}
```

Use this when an effect callback reads signals you do not want to track — for example, mounting DOM or binding a subtree while `activeObserver` is still the parent effect. Nested effects created inside `untracked` still track their own dependencies.

## Batch

```ts
import { batch } from "@chocosd/node-signals";

batch(() => {
  count.set(1);
  other.set(2);
});
// Effects run once, not per update.
```

## Pipelines (.to())

Transform and compose signals with a type-safe pipeline:

```ts
import { map, debug } from "@chocosd/node-signals";

const doubled = count.to(
  map((v) => v * 2),
  debug("doubled"),
);
```

Each step infers the callback input type from the previous step's output.

## Operators

| Operator | Purpose |
| --- | --- |
| `map` | Transform values |
| `debug` | Log pipeline values |
| `distinctUntilChanged` | Skip consecutive duplicates |
| `debounceTime` | Wait for quiet period |
| `throttleTime` | Limit emission rate |

```ts
import { debounceTime, distinctUntilChanged, throttleTime } from "@chocosd/node-signals";

search.to(debounceTime(300), distinctUntilChanged());
scroll.to(throttleTime(16));
```

Async operators return a `Promise` from the transform; the pipeline waits for resolution before updating downstream signals.

## computed

```ts
import { computed } from "@chocosd/node-signals";

const hasError = computed(() => !!error());
```

## from()

Create a signal from a promise factory or an emit-based source.

```ts
import { from } from "@chocosd/node-signals";

// Promise — re-runs when dependencies inside the factory change
const user = from(() =>
  fetch(`/api/users?date=${dateSig()}`).then((r) => r.json()),
);

// Emit-based — events, timers, observers
const tick = from<number>((emit) => {
  let value = 0;
  const id = setInterval(() => emit((value += 1)), 1000);
  return () => clearInterval(id);
});
```

## fromHttp()

```ts
import { createEffect, fromHttp } from "@chocosd/node-signals";

// URL can be a string or a reactive factory
const { data, loading, error } = fromHttp(
  () => `/posts?date=${dateSig()}`,
);

createEffect(() => {
  if (loading()) console.log("Loading…");
  if (error()) console.error(error());
  if (data()) console.log(data());
});
```

Pipe operators directly over the response — `.to()` on the result operates on the `data` signal:

```ts
const posts = fromHttp("/posts");

const filtered = posts.to(debounceTime(100), distinctUntilChanged());
// equivalent to: posts.data.to(debounceTime(100), distinctUntilChanged())
```

### Aborting

Every request runs under an `AbortController`. Changing a reactive url/param
automatically aborts the stale request, and `abort()` cancels the in-flight
request and stops the resource from reacting to further changes — handy in a
teardown hook:

```ts
const posts = fromHttp(() => `/posts?date=${dateSig()}`);

// later, e.g. onDestroy()
posts.abort();
```

### Interceptors

`fetch` has no built-in interceptors, so `fromHttp` adds a small pipeline.
Request interceptors transform `{ url, init }` before the request is sent;
response interceptors transform the `Response` before it is parsed. Each runs in
order and may be async. The abort signal is always attached at fetch time, so
interceptors can't accidentally disable cancellation.

```ts
const posts = fromHttp("/posts", {
  init: { headers: { accept: "application/json" } },
  interceptors: {
    request: [
      (req) => ({
        ...req,
        init: {
          ...req.init,
          headers: { ...req.init.headers, authorization: `Bearer ${token()}` },
        },
      }),
    ],
    response: [
      (res) => {
        if (res.status === 401) throw new Error("Unauthorized");
        return res;
      },
    ],
  },
});
```

Reactive inputs still belong in the `url` factory or `params` — interceptors are
for cross-cutting concerns (auth, logging, unwrapping) rather than reactivity.

## render() — browser only

Lightweight, effect-driven DOM fragments — not a component framework. Import from `@chocosd/node-signals/dom`.

```ts
import { signal } from "@chocosd/node-signals";
import { render } from "@chocosd/node-signals/dom";

const count = signal(0);

render("#app", (frag) => {
  const button = frag.createElement("button", { key: "counter" });
  const handler = () => count.set(count() + 1);

  button.addEventListener("click", handler);
  frag.onCleanup(() => button.removeEventListener("click", handler));

  button.textContent = `Count: ${count()}`;
  return button;
});
```

`render()` wraps `createEffect`. When signals read inside the view change, the view re-runs.

`createElement` accepts an optional options object:

| Option | Purpose |
| --- | --- |
| `key` | Reuse this element across re-renders (needed when registering listeners) |
| `text` | Keep text content in sync each render |
| `children` | Mount child nodes once — no manual `append`/`replaceChildren` |

```ts
render("#app", (frag) => {
  return frag.createElement("div", {
    key: "root",
    children: [
      frag.createElement("p", {
        key: "status",
        text: loading() ? "Loading…" : String(data() ?? ""),
      }),
    ],
  });
});
```

Register listeners with `frag.onCleanup()` — they run before each re-render.

## API overview

| Feature | Import from | Use for |
| --- | --- | --- |
| `signal` | `@chocosd/node-signals` | State |
| `computed` | `@chocosd/node-signals` | Derived values |
| `createEffect` | `@chocosd/node-signals` | Side effects |
| `.to()` | `@chocosd/node-signals` | Pipelines / composition |
| `from()` | `@chocosd/node-signals` | Async / event sources |
| `fromHttp()` | `@chocosd/node-signals` | API calls |
| `render()` | `@chocosd/node-signals/dom` | Browser DOM fragments |
