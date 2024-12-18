import { source } from "./source.ts";
import { parse, parseValue } from "./parse.ts";
import { tokenize } from "./tokenize.ts";
import {
  interpret,
  AjaxProResult,
  interpretWith,
  Constructors,
  interpretValueWith,
  defaultFunctions,
} from "./interpret.ts";
import * as Result from "./result.ts";

export function read(input: string): AjaxProResult {
  const read = Result.compose3(tokenize, parse, interpret);
  return read(source(input));
}

export function readWith(
  input: string,
  constructors: Constructors,
): AjaxProResult {
  const read = Result.compose3(tokenize, parse, (ast) =>
    interpretWith(ast, constructors),
  );
  return read(source(input));
}

export function readValueWith(input: string, constructors: Constructors): AjaxProResult {
  const tokens = tokenize(source(input))
  if (!tokens.ok) {
    return tokens
  }
  const ast = parseValue(tokens.value)
  if (!ast.ok) {
    return ast
  }

  const [value, idx] = ast.value
  if (idx < tokens.value.length) {
    return Result.error({ type: 'TrailingTokens', start: idx })
  }
  return interpretValueWith(value, constructors)
}

export function readValue(input: string) {
  return readValueWith(input, defaultFunctions)
}
