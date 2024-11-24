import { source } from "./source.ts";
import { parse } from "./parse.ts";
import { tokenize } from "./tokenize.ts";
import { interpret } from "./interpret.ts";

export function read(input: string) {
  const s = source(input);

  const tokens = tokenize(s);
  const ast = parse(tokens);

  if (!ast.ok) {
    throw new Error(
      `failed to parse text: ${ast.error.message ?? "unknown error"} @ token ${ast.error.idx}`,
    );
  }

  const result = interpret(ast.value);
  return result;
}