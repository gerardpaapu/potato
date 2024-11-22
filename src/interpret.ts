import { Ast, Value, OBJECT, ARRAY, FUNCALL, PRIMITIVE } from "./parse.ts";
import * as Result from "./result.ts";

type AjaxProResult = Result.T<unknown, unknown>;

export function interpret(ast: Ast): AjaxProResult {
  if (!ast.ok) {
    return { ok: false, error: extract(ast.error) };
  }

  return { ok: true, value: extract(ast.value) };
}

export function extract(v: Value): unknown {
  switch (v.type) {
    case PRIMITIVE:
      return v.value;

    case ARRAY: {
      return v.value.map(extract);
    }

    case OBJECT: {
      const result = {} as Record<string, unknown>;
      for (const k in v.value) {
        if (k === "__proto__") {
          continue;
        }
        result[k] = extract(v.value[k]);
      }
      return result;
    }

    case FUNCALL: {
      const { name, args, isConstructor } = v;
      if (name === "Data.Dictionary" && isConstructor) {
        const result = new Map();
        const pairs = args.map(extract)[1] as [string, unknown][];
        for (const [key, value] of pairs) {
          result.set(key, value);
        }

        return result;
      }

      return { name, args: args.map(extract), isConstructor };
    }
  }
}
