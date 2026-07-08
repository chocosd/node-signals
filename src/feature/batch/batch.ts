import { batch as runBatch } from "../../internal/batch.js";

export function batch(fn: () => void): void {
  runBatch(fn);
}
