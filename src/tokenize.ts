import { type Source, peek, pop, skipWhitespace } from "./source.ts";
import * as Result from "./result.ts";
import { ParseError } from "./parse-error.ts";

export type TokenType =
  | "ASSIGN"
  | "DOT"
  | "COMMA"
  | "ARROW"
  | "OPEN_BRACKET"
  | "CLOSE_BRACKET"
  | "OPEN_BRACE"
  | "CLOSE_BRACE"
  | "STRING_LITERAL"
  | "NUMBER_LITERAL"
  | "IDENTIFIER"
  | "OPEN_PAREN"
  | "CLOSE_PAREN"
  | "COLON"
  | "SEMICOLON"
  | "EPILOGUE";

export interface Token {
  type: TokenType;
  start: number;
  end: number;
  value?: string;
}

export function tokenize(src: Source): Result.T<Token[], ParseError> {
  const tokens = [] as Token[];
  skipWhitespace(src);
  for (;;) {
    switch (peek(src)) {
      case undefined:
        return Result.ok(tokens);

      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9": {
        const start = src.idx;
        const value = readNumberLiteral(src);
        if (value == undefined) {
          return Result.error({
            start: src.idx,
            type: "InvalidNumberLiteral",
          });
        }
        const end = src.idx;
        tokens.push({ type: "NUMBER_LITERAL", value: value, start, end });
        break;
      }

      case '"': {
        const start = src.idx;
        const result = readStringLiteral(src);
        if (!result.ok) {
          return result;
        }
        const end = src.idx;
        tokens.push({
          type: "STRING_LITERAL",
          value: result.value,
          start,
          end,
        });
        break;
      }

      case "=":
        pop(src);
        tokens.push({ type: "ASSIGN", start: src.idx - 1, end: src.idx });
        break;

      case "(":
        pop(src);
        tokens.push({ type: "OPEN_PAREN", start: src.idx - 1, end: src.idx });
        break;

      case ")":
        pop(src);
        tokens.push({ type: "CLOSE_PAREN", start: src.idx - 1, end: src.idx });
        break;

      case "[":
        pop(src);
        tokens.push({ type: "OPEN_BRACKET", start: src.idx - 1, end: src.idx });
        break;

      case "]":
        pop(src);
        tokens.push({
          type: "CLOSE_BRACKET",
          start: src.idx - 1,
          end: src.idx,
        });
        break;

      case "{":
        pop(src);
        tokens.push({ type: "OPEN_BRACE", start: src.idx - 1, end: src.idx });
        break;

      case "}":
        pop(src);
        tokens.push({ type: "CLOSE_BRACE", start: src.idx - 1, end: src.idx });
        break;

      case ";":
        pop(src);
        tokens.push({ type: "SEMICOLON", start: src.idx - 1, end: src.idx });
        break;

      case ":":
        pop(src);
        tokens.push({ type: "COLON", start: src.idx - 1, end: src.idx });
        break;

      case ".":
        pop(src);
        tokens.push({ type: "DOT", start: src.idx - 1, end: src.idx });
        break;

      case ",":
        pop(src);
        tokens.push({ type: "COMMA", start: src.idx - 1, end: src.idx });
        break;

      case "/":
        {
          pop(src);
          const star = pop(src);
          if (star !== "*") {
            return Result.error({
              start: src.idx,
              type: "ExpectedAsterisk",
            });
          }
          tokens.push({ type: "EPILOGUE", start: src.idx - 2, end: src.idx });
        }
        break;

      default: {
        const start = src.idx;
        const value = readIdentifier(src);
        if (value == undefined) {
          return Result.error({
            start: src.idx,
            type: "InvalidIdentifier",
          });
        }

        tokens.push({ type: "IDENTIFIER", value, start, end: src.idx });
      }
    }

    skipWhitespace(src);
  }
}

function readIdentifier(src: Source): string | undefined {
  const PATTERN = /[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*/uy;
  PATTERN.lastIndex = src.idx;
  const match = PATTERN.exec(src.str);
  if (match == undefined) {
    return undefined;
  }

  src.idx += match[0].length;
  return match[0];
}

function readNumberLiteral(src: Source): string | undefined {
  const PATTERN = /0|(((0\.)|([123456789]\d*))(\.\d+)?)/y;
  PATTERN.lastIndex = src.idx;
  const match = PATTERN.exec(src.str);
  if (match == undefined) {
    return undefined;
  }

  src.idx += match[0].length;
  return match[0];
}

const ESCAPES = {
  '"': '"',
  "'": "'",
  "\\": "\\",
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "\t",
} as Record<string, string | undefined>;

function readStringLiteral(src: Source): Result.T<string, ParseError> {
  const delimiter = pop(src);
  let value = "";
  while (src.idx < src.str.length) {
    switch (peek(src)) {
      case "\\":
        {
          pop(src);
          const code = pop(src);
          if (code === "u") {
            const code_point = parseInt(
              src.str.slice(src.idx, src.idx + 4),
              16,
            );
            value += String.fromCharCode(code_point);
            src.idx += 4;
          } else {
            const escape = ESCAPES[code];
            if (!escape) {
              return Result.error({
                start: src.idx,
                type: "InvalidStringLiteral",
              });
            }
            value += escape;
          }
        }
        break;

      case delimiter:
        pop(src);
        return Result.ok(value);

      default:
        value += pop(src);
    }
  }

  return Result.error({
    start: src.idx,
    type: "InvalidStringLiteral",
  });
}
