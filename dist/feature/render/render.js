import { createEffect } from "../effect/effect.js";
import { Fragment } from "./fragment.js";
export function render(container, view) {
    const target = typeof container === "string"
        ? document.querySelector(container)
        : container;
    if (!target) {
        throw new Error(`render target not found: ${String(container)}`);
    }
    const frag = new Fragment();
    let mountedRoot = null;
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
export { Fragment } from "./fragment.js";
