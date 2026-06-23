import type { Transform } from "../../types";

export function throttleTime<T>(ms: number): Transform<T, T> {
  let lastEmit = 0;

  return (src) => {
    const value = src();
    const now = Date.now();
    const elapsed = now - lastEmit;

    if (elapsed >= ms || lastEmit === 0) {
      lastEmit = now;
      return value;
    }

    return new Promise<T>((resolve) => {
      setTimeout(() => {
        lastEmit = Date.now();
        resolve(src());
      }, ms - elapsed);
    });
  };
}
