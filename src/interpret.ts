import { Ast, Value, OBJECT, ARRAY, FUNCALL, PRIMITIVE } from "./parse.ts";
import * as Result from "./result.ts";
import { ParseError } from "./parse-error.ts";

export type AjaxProResult = Result.T<unknown, unknown>;

export type Constructors = Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((...args: any[]) => any) | (new (...args: any[]) => any) | undefined
>;

export const defaultFunctions: Constructors = {
  "Data.Dictionary": function Dictionary(_typeGore, pairs) {
    if (!(this instanceof Dictionary)) {
      throw new TypeError("Data.Dictionary should be called with `new`");
    }

    const map = new Map();
    for (const [key, value] of pairs) {
      map.set(key, value);
    }
    return map;
  },
};

export function interpret(ast: Ast): AjaxProResult {
  return interpretWith(ast, defaultFunctions);
}

export function interpretWith(
  ast: Ast,
  functions: Constructors,
): AjaxProResult {
  if (!ast.ok) {
    const r = extract(ast.error, functions);
    if (!r.ok) {
      return r;
    }
    return { ok: false, error: r.value };
  }

  const r = extract(ast.value, functions);
  if (!r.ok) {
    return r;
  }
  return { ok: true, value: r.value };
}

export function interpretValueWith(ast: Value, constructors: Constructors) {
  return extract(ast, constructors)
}

export function interpretValue(ast: Value) {
  return extract(ast, defaultFunctions)
}

export function extract(
  v: Value,
  constructors: Constructors,
): Result.T<unknown, ParseError> {
  switch (v.type) {
    case PRIMITIVE:
      return Result.ok(v.value);

    case ARRAY: {
      const results = [] as Array<unknown>;
      for (const item of v.value) {
        const result = extract(item, constructors);
        if (!result.ok) {
          return result;
        }

        results.push(result.value);
      }

      return Result.ok(results);
    }

    case OBJECT: {
      const results = Object.create(null) as Record<string, unknown>;
      for (const k in v.value) {
        const result = extract(v.value[k], constructors);
        if (!result.ok) {
          return result;
        }
        results[k] = result.value;
      }

      return Result.ok(results);
    }

    case FUNCALL: {
      const { name, args, isConstructor } = v;
      if (name in constructors && typeof constructors[name] === "function") {
        const fn = constructors[name];
        const args$ = [] as Array<unknown>;
        for (const item of args) {
          const result = extract(item, constructors);
          if (!result.ok) {
            return result;
          }

          args$.push(result.value);
        }

        try {
          // @ts-expect-error we can't prove that these are valid constructors
          const results = isConstructor ? new fn(...args$) : fn(...args$);
          return Result.ok(results);
        } catch {
          return Result.error({
            start: 0,
            type: "ErrorInUserSuppliedFunction",
          });
        }
      }

      return Result.error({
        start: 0,
        type: "InvalidFunctionName",
      });
    }
  }
}
