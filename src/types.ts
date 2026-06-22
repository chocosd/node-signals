export type Cleanup = () => void;

export type EffectFn = () => void | Cleanup;

export type Effect = {
  (): void;
  active: boolean;
  cleanup?: Cleanup | undefined;
};

export type Transform<I, O> = (src: Signal<I>) => O;

type ToMethods<T> = {
  to<A>(fn: (src: Signal<T>) => A): Signal<A>;
  to<A, B>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<A>) => B,
  ): Signal<B>;
  to<A, B, C>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<A>) => B,
    fn3: (src: Signal<B>) => C,
  ): Signal<C>;
  to<A, B, C, D>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<A>) => B,
    fn3: (src: Signal<B>) => C,
    fn4: (src: Signal<C>) => D,
  ): Signal<D>;
  to<A, B, C, D, E>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<A>) => B,
    fn3: (src: Signal<B>) => C,
    fn4: (src: Signal<C>) => D,
    fn5: (src: Signal<D>) => E,
  ): Signal<E>;
};

export type Signal<T> = {
  (): T;
  set(v: T): void;
  update(updater: (prev: T) => T): void;
} & ToMethods<T>;
