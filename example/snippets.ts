export const snippets = {
  counter: `const count = signal(0);
const other = signal(0);

createEffect(() => {
  countDisplay.textContent = String(count());
  log(\`Counter effect ran → \${count()}\`);
});

batch(() => {
  count.set(count() + 5);
  other.set(other() + 10);
});`,

  pipeline: `const rawInput = signal(pipelineInput.value);

const pipeline = rawInput.to(
  map((value) => Number(value)),
  map((value) => value * 2),
  debounceTime(600),
  map((value) => value + 1),
);

createEffect(() => {
  const delayed = pipeline();
  pipelineDelayed.textContent = String(delayed ?? "…");
});`,

  search: `const search = signal("");

const debouncedSearch = search.to(
  debounceTime(400),
  distinctUntilChanged(),
);

const searchData = from<string>(() => {
  const query = debouncedSearch();

  if (!query) {
    return Promise.resolve("Type to search…");
  }

  return new Promise<string>((resolve) => {
    setTimeout(() => resolve(\`Results for "\${query}"\`), 300);
  });
});

createEffect(() => {
  searchResults.textContent = searchData() ?? "…";
});`,

  async: `const tick = signal(0);
let disposeTick: (() => void) | undefined;

function startTick() {
  disposeTick?.();
  tick.set(0);

  disposeTick = createEffect(() => {
    let active = true;
    let value = 0;

    const intervalId = window.setInterval(() => {
      if (!active) return;
      value += 1;
      tick.set(value);
    }, 1000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  });
}

// Equivalent emit-based from() source:
// from<number>((emit) => {
//   let active = true;
//   let value = 0;
//   const id = setInterval(() => {
//     if (!active) return;
//     value += 1;
//     emit(value);
//   }, 1000);
//   return () => {
//     active = false;
//     clearInterval(id);
//   };
// });

const tickDisplay = computed(() => {
  const value = tick() ?? 0;
  return {
    value,
    parity: value % 2 === 0 ? "even tick" : "odd tick",
  };
});`,

  effectLog: `function log(message: string): void {
  const item = document.createElement("li");
  const time = document.createElement("time");
  time.textContent = new Date().toLocaleTimeString();
  item.append(time, document.createTextNode(message));
  effectLog.prepend(item);
}

createEffect(() => {
  log(\`Counter effect ran → \${count()}\`);
});`,
} as const;

export type SnippetId = keyof typeof snippets;

export const snippetTitles: Record<SnippetId, string> = {
  counter: "Counter + batch",
  pipeline: "Pipeline operators",
  search: "Search (debounce + from)",
  async: "Async source",
  effectLog: "Effect log",
};
