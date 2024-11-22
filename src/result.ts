export type T<Value, Error> =
  | { ok: true; value: Value }
  | { ok: false; error: Error };

export function ok<Value, Error>(value: Value): T<Value, Error> {
  return { ok: true, value };
}

export function error<Value, Error>(error: Error): T<Value, Error> {
  return { ok: false, error };
}
