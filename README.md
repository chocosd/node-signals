# tiny-signals-core

A tiny reactive signals implementation with type-safe transform pipelines.

## Install

```bash
npm install tiny-signals-core
```

## Usage

```ts
import { signal, createEffect } from "tiny-signals-core";

const count = signal(0);

createEffect(() => {
  console.log(count());
});

count.set(1);
```

## Pipelines

Each step in `.to()` infers the callback input type from the previous step:

```ts
const input = signal("12");

const doubled = input.to(
  (sig) => Number(sig()), // sig: Signal<string>
  (sig) => sig() * 2,     // sig: Signal<number>
);
```

## Cleanup

```ts
const dispose = createEffect(() => {
  const id = setInterval(() => console.log(count()), 1000);

  return () => clearInterval(id);
});

dispose();
```

## Playground

Run the interactive example locally:

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Publish

```bash
npm run build
npm publish
```

The package ships only compiled output from `dist/`.
