import { type Token } from './tokenize.ts';
import { ParseError, ErrorType } from './parse-error.ts';
import * as Result from './result.ts';

export type Ast = Result.T<Value, Value>;
export type Success = [Value, number];
export type ParseResult = Result.T<Success, ParseError>;

export const OBJECT = 1;
export const ARRAY = 2;
export const FUNCALL = 3;
export const PRIMITIVE = 4;

type FunCall = {
  type: typeof FUNCALL;
  name: string;
  args: Value[];
  isConstructor: boolean;
};

export type Value =
  | { type: typeof OBJECT; value: Record<string, Value> }
  | { type: typeof ARRAY; value: Value[] }
  | FunCall
  | {
      type: typeof PRIMITIVE;
      value: string | number | undefined | null | boolean;
    };

function fail<T>(
  tokens: Token[],
  location: number,
  type: ErrorType
): Result.T<T, ParseError> {
  const { start, end } = tokens[location];
  return Result.error({ type, start, end });
}

export function parse(tokens: Token[]): Result.T<Ast, ParseError> {
  // eslint-disable-next-line prefer-const
  let [ok, idx] = parsePrologue(tokens, 0);
  const result = parseValue(tokens, idx);
  if (!result.ok) {
    return result;
  }

  const [value, next] = result.value;
  idx = next;
  if (idx >= tokens.length || tokens[idx].type !== 'SEMICOLON' || tokens[idx + 1].type !== 'EPILOGUE') {
    return fail(tokens, idx - 1, 'MissingEpilogue');
  }

  if (tokens.length > idx + 2) {
    return fail(tokens, idx, 'TrailingTokens');
  }

  return Result.ok(ok ? Result.ok(value) : Result.error(value));
}

function parsePrologue(tokens: Token[], idx: number): [boolean, number] {
  // the prologue is either empty or `null; r.error = `
  if (tokens.length > 6) {
    const [_null, semi, r, dot, error, eq] = tokens;
    if (
      _null.type === 'IDENTIFIER' &&
      _null.value === 'null' &&
      semi.type === 'SEMICOLON' &&
      r.type === 'IDENTIFIER' &&
      r.value == 'r' &&
      dot.type === 'DOT' &&
      error.type === 'IDENTIFIER' &&
      error.value === 'error' &&
      eq.type === 'ASSIGN'
    ) {
      return [false, idx + 6];
    }
  }

  return [true, idx];
}

export function parseValue(tokens: Token[], idx: number = 0): ParseResult {
  switch (tokens[idx].type) {
    case 'OPEN_BRACKET':
      return parseArray(tokens, idx);

    case 'OPEN_BRACE':
      return parseObject(tokens, idx);

    case 'NUMBER_LITERAL':
      return Result.ok([
        { type: PRIMITIVE, value: JSON.parse(tokens[idx].value!) },
        ++idx,
      ]);

    case 'STRING_LITERAL':
      return Result.ok([{ type: PRIMITIVE, value: tokens[idx].value }, ++idx]);

    case 'IDENTIFIER': {
      const value = tokens[idx].value;
      if (value === 'undefined') {
        return Result.ok([{ type: PRIMITIVE, value: undefined }, ++idx]);
      }

      if (value === 'null') {
        return Result.ok([{ type: PRIMITIVE, value: null }, ++idx]);
      }

      if (value === 'true') {
        return Result.ok([{ type: PRIMITIVE, value: true }, ++idx]);
      }

      if (value === 'false') {
        return Result.ok([{ type: PRIMITIVE, value: false }, ++idx]);
      }

      if (value === 'new') {
        idx++; // skip the "new"
        const result = parseFuncall(tokens, idx);
        if (!result.ok) {
          return result;
        }

        const [funcall, next] = result.value;
        return Result.ok([{ ...funcall, isConstructor: true }, next]);
      }

      return parseFuncall(tokens, idx);
    }
  }

  return fail(tokens, idx, 'UnexpectedToken');
}

// array  := '[' inner ']'
// inner  := head tail | empty
// tail   := ',' value tail
//        := empty

function parseArray(tokens: Token[], idx: number): ParseResult {
  idx++; // skip the bracket
  const results = [];
  if (idx >= tokens.length) {
    return fail(tokens, idx - 1, 'UnexpectedEndOfInput');
  }

  if (tokens[idx].type === 'CLOSE_BRACKET') {
    return Result.ok([{ type: ARRAY, value: [] }, ++idx]);
  }


  {
    const item = parseValue(tokens, idx);
    if (!item.ok) {
      return item;
    }

    const [value, next] = item.value;
    results.push(value);
    idx = next;
  }

  for (;;) {
    if (idx >= tokens.length) {
      return fail(tokens, idx - 1, 'UnexpectedEndOfInput');
    }

    if (tokens[idx].type === 'CLOSE_BRACKET') {
      return Result.ok([{ type: ARRAY, value: results }, ++idx]);
    }

    // otherwise this must be a comma
    if (tokens[idx].type !== 'COMMA') {
      return fail(tokens, idx, 'ExpectedComma');
    }
    idx++;

    const item = parseValue(tokens, idx);
    if (!item.ok) {
      return item;
    }

    const [value, next] = item.value;
    results.push(value);
    idx = next;
  }
}

// object := '{' inner '}'
// inner := empty | head tail
// head  := key ':' value
// tail  := empty | ',' key ':' value tail
function parseObject(tokens: Token[], idx: number): ParseResult {
  idx++; // skip the bracket
  const results = {} as Record<string, Value>;
  if (idx >= tokens.length) {
    return fail(tokens, idx - 1, 'UnexpectedEndOfInput');
  }

  if (tokens[idx].type === 'CLOSE_BRACE') {
    return Result.ok([{ type: OBJECT, value: results }, ++idx]);
  }
 
  {
    if (tokens[idx].type !== 'STRING_LITERAL') {
      return fail(tokens, idx, 'ExpectedStringKey');
    }
    const key = tokens[idx].value;
    idx++;

    if (tokens[idx].type !== 'COLON') {
      return fail(tokens, idx, 'ExpectedColon');
    }
    idx++;
    const item = parseValue(tokens, idx);
    if (!item.ok) {
      return item;
    }

    const [value, next] = item.value;
    if (key !== '__proto__') {
      results[key!] = value;
    }
    idx = next;
  }

  for (;;) {
    if (idx >= tokens.length) {
      return fail(tokens, idx - 1, 'UnexpectedEndOfInput');
    }

    if (tokens[idx].type === 'CLOSE_BRACE') {
      return Result.ok([{ type: OBJECT, value: results }, ++idx]);
    }

    // otherwise this must be a comma
    if (tokens[idx].type !== 'COMMA') {
      return fail(tokens, idx, 'ExpectedComma');
    }
    idx++;
    if (idx >= tokens.length) {
      return fail(tokens, idx - 1, 'UnexpectedEndOfInput');
    }
    if (tokens[idx].type !== 'STRING_LITERAL') {
      return fail(tokens, idx, 'ExpectedStringKey');
    }

    const key = tokens[idx].value;
    idx++;

    if (tokens[idx].type !== 'COLON') {
      return fail(tokens, idx, 'ExpectedColon');
    }

    idx++;
    const item = parseValue(tokens, idx);
    if (!item.ok) {
      return item;
    }

    const [value, next] = item.value;
    if (key !== '__proto__') {
      results[key!] = value;
    }
    idx = next;
  }
}

function parseFuncall(tokens: Token[], idx: number): ParseResult {
  const names = [];

  names.push(tokens[idx++].value);
  while (tokens[idx].type === 'DOT') {
    idx++; // skip the dot
    if (idx >= tokens.length) {
      return fail(tokens, idx - 1, 'UnexpectedEndOfInput');
    }
    if (tokens[idx].type !== 'IDENTIFIER') {
      return fail(tokens, idx, 'ExpectedFunctionName');
    }
    names.push(tokens[idx++].value);
  }

  const fqn = names.join('.');
  const args = [] as Value[];
  if (tokens[idx].type !== 'OPEN_PAREN') {
    return fail(tokens, idx, 'ExpectedArgumentsList');
  }
  idx++;
  if (idx >= tokens.length) {
    return fail(tokens, idx - 1, 'UnexpectedEndOfInput');
  }

  if (tokens[idx].type === 'CLOSE_PAREN') {
    return Result.ok([
      { type: FUNCALL, name: fqn, args, isConstructor: false },
      ++idx,
    ]);
  }

  {
    const result = parseValue(tokens, idx);
    if (!result.ok) {
      return result;
    }

    const [value, next] = result.value;
    idx = next;
    args.push(value);
  }

  for (;;) {
    if (idx >= tokens.length) {
      return fail(tokens, idx - 1, 'UnexpectedEndOfInput');
    }

    if (tokens[idx].type === 'CLOSE_PAREN') {
      return Result.ok([
        { type: FUNCALL, name: fqn, args, isConstructor: false },
        ++idx,
      ]);
    }

    if (tokens[idx].type !== 'COMMA') {
      return fail(tokens, idx, 'ExpectedComma');
    }
    idx++; // skip the comma
    const result = parseValue(tokens, idx);
    if (!result.ok) {
      return result;
    }

    const [value, next] = result.value;
    idx = next;
    args.push(value);
  }
}
