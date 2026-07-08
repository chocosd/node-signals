import type { Cleanup } from "../../types.js";
export type CreateElementOptions = {
    /** Reuse this element across re-renders instead of creating a new one. */
    key?: string;
    /** Mount once under this element — handled internally, not on every render. */
    children?: Node[];
    /** Keep text content in sync each render. */
    text?: string;
};
export declare class Fragment {
    private cleanups;
    private keyedElements;
    private mountedParents;
    createElement<K extends keyof HTMLElementTagNameMap>(tag: K, options?: CreateElementOptions): HTMLElementTagNameMap[K];
    onCleanup(fn: Cleanup): void;
    runCleanup(): void;
    private resolveElement;
    private appendOnce;
}
