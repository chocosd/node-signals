import { createEffect } from "../effect/effect";
import { Fragment } from "./fragment";

export type RenderView = (frag: Fragment) => Node;

export function render(
  container: string | Element,
  view: RenderView,
): () => void {
  const target =
    typeof container === "string"
      ? document.querySelector(container)
      : container;

  if (!target) {
    throw new Error(`render target not found: ${String(container)}`);
  }

  const frag = new Fragment();
  let mountedRoot: Node | null = null;

  const dispose = createEffect(() => {
    const result = view(frag);

    if (mountedRoot !== result) {
      target.replaceChildren(result);
      mountedRoot = result;
    }

    return () => {
      frag.runCleanup();
    };
  });

  return () => {
    dispose();
    target.replaceChildren();
    mountedRoot = null;
  };
}

export { Fragment } from "./fragment";
