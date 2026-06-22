import { activeEffect, setActiveEffect } from "../../internal/context";
import type { Effect, EffectFn } from "../../types";

export function createEffect(fn: EffectFn): () => void {
  const effect: Effect = (() => {
    if (!effect.active) return;

    const prev = activeEffect;
    setActiveEffect(effect);

    try {
      effect.cleanup?.();
      const result = fn();
      effect.cleanup = typeof result === "function" ? result : undefined;
    } finally {
      setActiveEffect(prev);
    }
  }) as Effect;

  effect.active = true;
  effect();

  return () => {
    if (!effect.active) {
      return;
    }

    effect.active = false;
    effect.cleanup?.();
    effect.cleanup = undefined;
  };
}
