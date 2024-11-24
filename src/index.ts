import { source } from "./source.ts";
import { parse } from "./parse.ts";
import { tokenize } from "./tokenize.ts";
import {
  interpret,
  AjaxProResult,
  interpretWith,
  Constructors,
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
