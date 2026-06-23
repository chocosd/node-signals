import type { Transform } from "../../types";

export function distinctUntilChanged<T>(
  equals: (previous: T, current: T) => boolean = Object.is,
): Transform<T, T> {
  let previous: T | undefined;
  let hasPrevious = false;

  return (src) => {
    const value = src();

    if (hasPrevious && equals(previous as T, value)) {
      return previous as T;
    }

    previous = value;
    hasPrevious = true;
    return value;
  };
}
