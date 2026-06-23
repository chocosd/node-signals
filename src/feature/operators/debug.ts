import type { Transform } from "../../types";

export function debug<T>(label = "debug"): Transform<T, T> {
  return (src) => {
    const value = src();
    console.log(label, value);
    return value;
  };
}
