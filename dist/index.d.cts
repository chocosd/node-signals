declare function batch(fn: () => void): void;

type Cleanup = () => void;
type EffectFn = () => void | Cleanup;
type Effect = {
    (): void;
    active: boolean;
    cleanup?: Cleanup | undefined;
};
type Resolved<T> = T extends PromiseLike<infer U> ? U : T;
type Transform<I, O> = (src: Signal<I>) => O | Promise<O>;
type Operator<I, O> = Transform<I, O>;
type ToMethods<T> = {
    to<A>(fn: (src: Signal<T>) => A): Signal<Resolved<A>>;
    to<A, B>(fn1: (src: Signal<T>) => A, fn2: (src: Signal<Resolved<A>>) => B): Signal<Resolved<B>>;
    to<A, B, C>(fn1: (src: Signal<T>) => A, fn2: (src: Signal<Resolved<A>>) => B, fn3: (src: Signal<Resolved<B>>) => C): Signal<Resolved<C>>;
    to<A, B, C, D>(fn1: (src: Signal<T>) => A, fn2: (src: Signal<Resolved<A>>) => B, fn3: (src: Signal<Resolved<B>>) => C, fn4: (src: Signal<Resolved<C>>) => D): Signal<Resolved<D>>;
    to<A, B, C, D, E>(fn1: (src: Signal<T>) => A, fn2: (src: Signal<Resolved<A>>) => B, fn3: (src: Signal<Resolved<B>>) => C, fn4: (src: Signal<Resolved<C>>) => D, fn5: (src: Signal<Resolved<D>>) => E): Signal<Resolved<E>>;
};
type Signal<T> = {
    (): T;
    set(v: T): void;
    update(updater: (prev: T) => T): void;
} & ToMethods<T>;

declare function computed<T>(fn: () => T): Signal<T>;

declare function createEffect(fn: EffectFn): () => void;

type EmitFactory<T> = (emit: (value: T) => void) => Cleanup;
type ValueFactory<T> = () => T | Promise<T>;
declare function from<T>(factory: ValueFactory<T>): Signal<T | undefined>;
declare function from<T>(factory: EmitFactory<T>): Signal<T | undefined>;

type FromHttpOptions = {
    params?: () => Record<string, string | number | boolean | undefined | null>;
};
type FromHttpResult<T> = {
    data: Signal<T | undefined>;
    loading: Signal<boolean>;
    error: Signal<Error | undefined>;
};
declare function fromHttp<T>(url: string, options?: FromHttpOptions): FromHttpResult<T>;

declare function map<T, U>(fn: (value: T) => U): Transform<T, U>;

declare function debug<T>(label?: string): Transform<T, T>;

declare function distinctUntilChanged<T>(equals?: (previous: T, current: T) => boolean): Transform<T, T>;

declare function debounceTime<T>(ms: number): Transform<T, T>;

declare function throttleTime<T>(ms: number): Transform<T, T>;

declare class Fragment {
    private cleanups;
    private keyedElements;
    createElement<K extends keyof HTMLElementTagNameMap>(tag: K, key?: string): HTMLElementTagNameMap[K];
    onCleanup(fn: Cleanup): void;
    runCleanup(): void;
}

type RenderView = (frag: Fragment) => Node;
declare function render(container: string | Element, view: RenderView): () => void;

declare function signal<T>(initial: T): Signal<T>;

export { type Cleanup, type Effect, type EffectFn, Fragment, type FromHttpOptions, type FromHttpResult, type Operator, type RenderView, type Resolved, type Signal, type Transform, batch, computed, createEffect, debounceTime, debug, distinctUntilChanged, from, fromHttp, map, render, signal, throttleTime };
