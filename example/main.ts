import { createEffect, signal } from "tiny-signals-core";

const countDisplay = document.querySelector<HTMLElement>("#count-display")!;
const countDec = document.querySelector<HTMLButtonElement>("#count-dec")!;
const countInc = document.querySelector<HTMLButtonElement>("#count-inc")!;
const countReset = document.querySelector<HTMLButtonElement>("#count-reset")!;

const pipelineInput =
  document.querySelector<HTMLInputElement>("#pipeline-input")!;
const pipelineParsed = document.querySelector<HTMLElement>("#pipeline-parsed")!;
const pipelineDoubled =
  document.querySelector<HTMLElement>("#pipeline-doubled")!;

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

const count = signal(0);

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

const rawInput = signal(pipelineInput.value);

pipelineInput.addEventListener("input", () => {
  rawInput.set(pipelineInput.value);
});

const pipeline = rawInput.to(
  (sig) => Number(sig()),
  (sig) => sig() * 2,
  (sig) => setTimeout(() => sig(), 2000),
);

createEffect(() => {
  const parsed = Number(rawInput());
  pipelineParsed.textContent = Number.isNaN(parsed) ? "NaN" : String(parsed);
  log(`Pipeline parsed → ${pipelineParsed.textContent}`);
});

createEffect(() => {
  const doubled = pipeline();
  pipelineDoubled.textContent = Number.isNaN(doubled) ? "NaN" : String(doubled);
  log(`Pipeline doubled → ${pipelineDoubled.textContent}`);
});

clearLog.addEventListener("click", () => {
  effectLog.replaceChildren();
});
