import { source } from './source.ts';
import { parse } from './parse.ts';
import { tokenize } from './tokenize.ts';
import { interpret, AjaxProResult } from './interpret.ts';
import * as Result from './result.ts';

export function read(input: string): AjaxProResult {
  const read = Result.compose3(tokenize, parse, interpret);
  return read(source(input));
}
