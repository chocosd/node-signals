import type { Transform } from "../../types.js";

export function debounceTime<T>(ms: number): Transform<T, T> {
  return (src) =>
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(src()), ms);
    });
}
