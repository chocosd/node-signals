import type { Transform } from "../../types.js";

export function debug<T>(label = "debug"): Transform<T, T> {
  return (src) => {
    const value = src();
    console.log(label, value);
    return value;
  };
}
