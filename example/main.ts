import {
  batch,
  computed,
  createEffect,
  debounceTime,
  distinctUntilChanged,
  from,
  map,
  signal,
} from "tiny-signals-core";
import { initCodeDrawer } from "./drawer";

const countDisplay = document.querySelector<HTMLElement>("#count-display")!;
const countDec = document.querySelector<HTMLButtonElement>("#count-dec")!;
const countInc = document.querySelector<HTMLButtonElement>("#count-inc")!;
const countReset = document.querySelector<HTMLButtonElement>("#count-reset")!;
const batchRun = document.querySelector<HTMLButtonElement>("#batch-run")!;

const pipelineInput =
  document.querySelector<HTMLInputElement>("#pipeline-input")!;
const pipelineParsed = document.querySelector<HTMLElement>("#pipeline-parsed")!;
const pipelineDelayed =
  document.querySelector<HTMLElement>("#pipeline-delayed")!;

const searchInput =
  document.querySelector<HTMLInputElement>("#search-input")!;
const searchResults =
  document.querySelector<HTMLElement>("#search-results")!;

const asyncStatus = document.querySelector<HTMLElement>("#async-status")!;
const asyncValue = document.querySelector<HTMLElement>("#async-value")!;
const asyncStop = document.querySelector<HTMLButtonElement>("#async-stop")!;
const asyncStart = document.querySelector<HTMLButtonElement>("#async-start")!;

const effectLog = document.querySelector<HTMLUListElement>("#effect-log")!;
const clearLog = document.querySelector<HTMLButtonElement>("#clear-log")!;

function log(message: string): void {
  const item = document.createElement("li");
  const time = document.createElement("time");

  time.dateTime = new Date().toISOString();
  time.textContent = new Date().toLocaleTimeString();
  item.append(time, document.createTextNode(message));
  effectLog.prepend(item);
}

initCodeDrawer();

const count = signal(0);
const other = signal(0);

createEffect(() => {
  countDisplay.textContent = String(count());
  log(`Counter effect ran → ${count()}`);
});

countInc.addEventListener("click", () => {
  count.update((value) => value + 1);
});

countDec.addEventListener("click", () => {
  count.update((value) => value - 1);
});

countReset.addEventListener("click", () => {
  count.set(0);
});

batchRun.addEventListener("click", () => {
  batch(() => {
    count.set(count() + 5);
    other.set(other() + 10);
  });
  log(`Batch applied → count ${count()}, other ${other()}`);
});

const rawInput = signal(pipelineInput.value);

pipelineInput.addEventListener("input", () => {
  rawInput.set(pipelineInput.value);
});

const pipeline = rawInput.to(
  map((value) => Number(value)),
  map((value) => value * 2),
  debounceTime(600),
  map((value) => value + 1),
);

createEffect(() => {
  const parsed = Number(rawInput());
  pipelineParsed.textContent = Number.isNaN(parsed) ? "NaN" : String(parsed);
  log(`Pipeline parsed → ${pipelineParsed.textContent}`);
});

createEffect(() => {
  const delayed = pipeline();
  pipelineDelayed.textContent =
    delayed === undefined || Number.isNaN(delayed) ? "…" : String(delayed);
  log(`Pipeline delayed → ${pipelineDelayed.textContent}`);
});

const search = signal("");

searchInput.addEventListener("input", () => {
  search.set(searchInput.value);
});

const debouncedSearch = search.to(debounceTime(400), distinctUntilChanged());

const searchData = from<string>(() => {
  const query = debouncedSearch();

  if (!query) {
    return Promise.resolve("Type to search…");
  }

  return new Promise<string>((resolve) => {
    setTimeout(() => resolve(`Results for "${query}"`), 300);
  });
});

createEffect(() => {
  searchResults.textContent = searchData() ?? "…";
  log(`Search results → ${searchResults.textContent}`);
});

const tick = signal(0);
let disposeTick: (() => void) | undefined;

function startTick(): void {
  disposeTick?.();
  tick.set(0);

  disposeTick = createEffect(() => {
    let active = true;
    let value = 0;

    const intervalId = window.setInterval(() => {
      if (!active) {
        return;
      }

      value += 1;
      tick.set(value);
    }, 1000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  });

  asyncStop.disabled = false;
  asyncStart.disabled = true;
}

function stopTick(): void {
  disposeTick?.();
  disposeTick = undefined;
  tick.set(0);
  asyncStop.disabled = true;
  asyncStart.disabled = false;
}

const tickDisplay = computed(() => {
  const value = tick() ?? 0;

  return {
    value,
    parity: value % 2 === 0 ? "even tick" : "odd tick",
  };
});

createEffect(() => {
  const { value, parity } = tickDisplay();
  asyncStatus.textContent = parity;
  asyncValue.textContent = String(value);
  log(`Async tick → ${value} (${parity})`);
});

startTick();

asyncStop.addEventListener("click", stopTick);
asyncStart.addEventListener("click", startTick);

clearLog.addEventListener("click", () => {
  effectLog.replaceChildren();
});
