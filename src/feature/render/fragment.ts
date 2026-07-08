import type { Cleanup } from "../../types.js";

export type CreateElementOptions = {
  /** Reuse this element across re-renders instead of creating a new one. */
  key?: string;
  /** Mount once under this element — handled internally, not on every render. */
  children?: Node[];
  /** Keep text content in sync each render. */
  text?: string;
};

export class Fragment {
  private cleanups: Cleanup[] = [];
  private keyedElements = new Map<string, HTMLElement>();
  private mountedParents = new WeakSet<HTMLElement>();

  createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options?: CreateElementOptions,
  ): HTMLElementTagNameMap[K] {
    const element = this.resolveElement(tag, options?.key);

    if (options?.text !== undefined) {
      element.textContent = options.text;
    }

    if (options?.children !== undefined && options.children.length > 0) {
      this.appendOnce(element, ...options.children);
    }

    return element;
  }

  onCleanup(fn: Cleanup): void {
    this.cleanups.push(fn);
  }

  runCleanup(): void {
    for (const fn of this.cleanups) {
      fn();
    }

    this.cleanups = [];
  }

  private resolveElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    key?: string,
  ): HTMLElementTagNameMap[K] {
    if (key !== undefined) {
      const existing = this.keyedElements.get(key);

      if (existing) {
        return existing as HTMLElementTagNameMap[K];
      }

      const element = document.createElement(tag);
      this.keyedElements.set(key, element);
      return element;
    }

    return document.createElement(tag);
  }

  private appendOnce(parent: HTMLElement, ...children: Node[]): void {
    if (this.mountedParents.has(parent)) {
      return;
    }

    parent.append(...children);
    this.mountedParents.add(parent);
  }
}
