export type T<Value, Error> =
  | { ok: true; value: Value }
  | { ok: false; error: Error };

export function ok<Value, Error>(value: Value): T<Value, Error> {
  return { ok: true, value };
}

export function error<Value, Error>(error: Error): T<Value, Error> {
  return { ok: false, error };
}

function bind<A, B, E>(f: (a: A) => T<B, E>, a: T<A, E>): T<B, E> {
  if (!a.ok) {
    return a;
  }
  return f(a.value);
}

export function compose<A, B, C, E>(
  f: (a: A) => T<B, E>,
  g: (b: B) => T<C, E>,
): (a: A) => T<C, E> {
  return (a: A) => bind(g, f(a));
}

export function compose3<A, B, C, D, E>(
  f: (a: A) => T<B, E>,
  g: (b: B) => T<C, E>,
  h: (b: C) => T<D, E>,
): (a: A) => T<D, E> {
  return (a: A) => bind(h, bind(g, f(a)));
}
