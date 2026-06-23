export type Cleanup = () => void;

export type EffectFn = () => void | Cleanup;

export type Effect = {
  (): void;
  active: boolean;
  cleanup?: Cleanup | undefined;
};

export type Resolved<T> = T extends PromiseLike<infer U> ? U : T;

export type Transform<I, O> = (src: Signal<I>) => O | Promise<O>;

export type Operator<I, O> = Transform<I, O>;

type ToMethods<T> = {
  to<A>(fn: (src: Signal<T>) => A): Signal<Resolved<A>>;
  to<A, B>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<Resolved<A>>) => B,
  ): Signal<Resolved<B>>;
  to<A, B, C>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<Resolved<A>>) => B,
    fn3: (src: Signal<Resolved<B>>) => C,
  ): Signal<Resolved<C>>;
  to<A, B, C, D>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<Resolved<A>>) => B,
    fn3: (src: Signal<Resolved<B>>) => C,
    fn4: (src: Signal<Resolved<C>>) => D,
  ): Signal<Resolved<D>>;
  to<A, B, C, D, E>(
    fn1: (src: Signal<T>) => A,
    fn2: (src: Signal<Resolved<A>>) => B,
    fn3: (src: Signal<Resolved<B>>) => C,
    fn4: (src: Signal<Resolved<C>>) => D,
    fn5: (src: Signal<Resolved<D>>) => E,
  ): Signal<Resolved<E>>;
};

export type Signal<T> = {
  (): T;
  set(v: T): void;
  update(updater: (prev: T) => T): void;
} & ToMethods<T>;
