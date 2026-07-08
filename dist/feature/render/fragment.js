export class Fragment {
    constructor() {
        Object.defineProperty(this, "cleanups", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "keyedElements", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "mountedParents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new WeakSet()
        });
    }
    createElement(tag, options) {
        const element = this.resolveElement(tag, options?.key);
        if (options?.text !== undefined) {
            element.textContent = options.text;
        }
        if (options?.children !== undefined && options.children.length > 0) {
            this.appendOnce(element, ...options.children);
        }
        return element;
    }
    onCleanup(fn) {
        this.cleanups.push(fn);
    }
    runCleanup() {
        for (const fn of this.cleanups) {
            fn();
        }
        this.cleanups = [];
    }
    resolveElement(tag, key) {
        if (key !== undefined) {
            const existing = this.keyedElements.get(key);
            if (existing) {
                return existing;
            }
            const element = document.createElement(tag);
            this.keyedElements.set(key, element);
            return element;
        }
        return document.createElement(tag);
    }
    appendOnce(parent, ...children) {
        if (this.mountedParents.has(parent)) {
            return;
        }
        parent.append(...children);
        this.mountedParents.add(parent);
    }
}
