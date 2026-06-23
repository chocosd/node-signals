# tiny-signals-core

A lightweight reactive engine: signals, effects, pipelines, operators, and async sources.

## Install

```bash
npm install tiny-signals-core
```

## Signal

```ts
import { signal } from "tiny-signals-core";

const count = signal(0);

count();              // read
count.set(1);         // write
count.update((v) => v + 1);
```

## Effect

```ts
import { createEffect } from "tiny-signals-core";

createEffect(() => {
  console.log(count());
});
```

## Batch

```ts
import { batch } from "tiny-signals-core";

batch(() => {
  count.set(1);
  other.set(2);
});
// Effects run once, not per update.
```

## Pipelines (.to())

```ts
import { map, debug } from "tiny-signals-core";

const doubled = count.to(
  map((v) => v * 2),
  debug("doubled"),
);
```

## Operators

| Operator | Purpose |
| --- | --- |
| `map` | Transform values |
| `debug` | Log pipeline values |
| `distinctUntilChanged` | Skip consecutive duplicates |
| `debounceTime` | Wait for quiet period |
| `throttleTime` | Limit emission rate |

```ts
search.to(debounceTime(300), distinctUntilChanged());
scroll.to(throttleTime(16));
```

Async operators return a `Promise` from the transform; the pipeline waits for resolution before updating downstream signals.

## computed

```ts
import { computed } from "tiny-signals-core";

const hasError = computed(() => !!error());
```

## from()

Create a signal from a promise factory or an emit-based source.

```ts
import { from } from "tiny-signals-core";

// Promise — re-runs when dependencies inside the factory change
const user = from(() =>
  fetch(`/api/users?date=${dateSig()}`).then((r) => r.json()),
);

// Emit-based — events, RAF, observers
const frame = from<number>((emit) => {
  let active = true;

  function loop(t: number) {
    if (!active) return;
    emit(t);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
  return () => {
    active = false;
  };
});
```

## fromHttp()

```ts
import { fromHttp } from "tiny-signals-core";

const { data, loading, error } = fromHttp("/posts", {
  params: () => ({ date: dateSig() }),
});

createEffect(() => {
  if (loading()) console.log("Loading…");
  if (error()) console.error(error());
  if (data()) console.log(data());
});
```

Use pipelines on HTTP data:

```ts
const filtered = data.to(debounceTime(100), distinctUntilChanged());
```

## When to use what

| Feature | Use for |
| --- | --- |
| `signal` | State |
| `computed` | Derived values |
| `createEffect` | Side effects |
| `.to()` | Pipelines / composition |
| `from()` | Async / event sources |
| `fromHttp()` | API calls |

## Playground

```bash
npm install
npm run dev
```

## Publish

```bash
npm run build
npm publish
```
