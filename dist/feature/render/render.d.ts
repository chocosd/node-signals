import { Fragment } from "./fragment.js";
export type RenderView = (frag: Fragment) => Node;
export declare function render(container: string | Element, view: RenderView): () => void;
export { Fragment } from "./fragment.js";
export type { CreateElementOptions } from "./fragment.js";
