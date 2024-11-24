import { Ast, Value, OBJECT, ARRAY, FUNCALL, PRIMITIVE } from './parse.ts';
import * as Result from './result.ts';
import { ParseError } from './parse-error.ts';

export type AjaxProResult = Result.T<unknown, unknown>;

export function interpret(ast: Ast): AjaxProResult {
  if (!ast.ok) {
    const r = extract(ast.error);
    if (!r.ok) {
      return r;
    }
    return { ok: false, error: r.value };
  }

  const r = extract(ast.value);
  if (!r.ok) {
    return r;
  }
  return { ok: true, value: r.value };
}

export function extract(v: Value): Result.T<unknown, ParseError> {
  switch (v.type) {
    case PRIMITIVE:
      return Result.ok(v.value);

    case ARRAY: {
      const results = [] as Array<unknown>;
      for (const item of v.value) {
        const result = extract(item);
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
        if (k === '__proto__') {
          continue;
        }
        const result = extract(v.value[k]);
        if (!result.ok) {
          return result;
        }
        results[k] = result.value;
      }

      return Result.ok(results);
    }

    case FUNCALL: {
      const { name, args, isConstructor } = v;
      if (name === 'Data.Dictionary' && isConstructor) {
        const results = new Map();
        const pairs = extract(args[1]);
        if (!pairs.ok) {
          return pairs;
        }

        for (const [key, value] of pairs.value as Array<['string', unknown]>) {
          results.set(key, value);
        }

        return Result.ok(results);
      }

      return Result.error({
        start: 0,
        type: 'InvalidFunctionName',
      });
    }
  }
}
