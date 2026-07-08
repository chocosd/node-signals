import type { Effect } from "../types.js";

export let activeEffect: Effect | null = null;

export function setActiveEffect(effect: Effect | null): void {
  activeEffect = effect;
}
