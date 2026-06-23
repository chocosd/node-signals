import type { Transform } from "../../types";

export function debounceTime<T>(ms: number): Transform<T, T> {
  return (src) =>
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(src()), ms);
    });
}
