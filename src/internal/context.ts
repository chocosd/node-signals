import type { Effect } from "../types";

export let activeEffect: Effect | null = null;

export function setActiveEffect(effect: Effect | null): void {
  activeEffect = effect;
}
