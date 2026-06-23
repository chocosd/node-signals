import { batch as runBatch } from "../../internal/batch";

export function batch(fn: () => void): void {
  runBatch(fn);
}
