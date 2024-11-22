import { type Source, peek, pop, skipWhitespace } from "./source.ts";

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
  value?: string;
}

export function tokenize(src: Source): Token[] {
  const tokens = [] as Token[];
  skipWhitespace(src);
  for (;;) {
    switch (peek(src)) {
      case undefined:
        return tokens;

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
        const value = readNumberLiteral(src);
        if (value == undefined) {
          throw new Error("Invalid number literal");
        }
        tokens.push({ type: "NUMBER_LITERAL", value: value });
        break;
      }

      case '"': {
        const value = readStringLiteral(src);
        if (value == undefined) {
          throw new Error("Invalid string literal");
        }
        tokens.push({ type: "STRING_LITERAL", value });
        break;
      }

      case "=":
        pop(src);
        tokens.push({ type: "ASSIGN" });
        break;

      case "(":
        pop(src);
        tokens.push({ type: "OPEN_PAREN" });
        break;

      case ")":
        pop(src);
        tokens.push({ type: "CLOSE_PAREN" });
        break;

      case "[":
        pop(src);
        tokens.push({ type: "OPEN_BRACKET" });
        break;

      case "]":
        pop(src);
        tokens.push({ type: "CLOSE_BRACKET" });
        break;

      case "{":
        pop(src);
        tokens.push({ type: "OPEN_BRACE" });
        break;

      case "}":
        pop(src);
        tokens.push({ type: "CLOSE_BRACE" });
        break;

      case ";":
        pop(src);
        tokens.push({ type: "SEMICOLON" });
        break;

      case ":":
        pop(src);
        tokens.push({ type: "COLON" });
        break;

      case ".":
        pop(src);
        tokens.push({ type: "DOT" });
        break;

      case ",":
        pop(src);
        tokens.push({ type: "COMMA" });
        break;

      case "/":
        {
          pop(src);
          const star = pop(src);
          if (star !== "*") {
            throw new Error("expected asterisk");
          }
          tokens.push({ type: "EPILOGUE" });
        }
        break;

      default: {
        const value = readIdentifier(src);
        if (value == undefined) {
          console.error(tokens);
          throw new Error(
            `invalid identifier: ${src.str.slice(src.idx, src.idx + 3)}`,
          );
        }

        tokens.push({ type: "IDENTIFIER", value });
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

function readStringLiteral(src: Source) {
  const start = src.idx;
  const delimiter = pop(src);
  if (delimiter !== '"' && delimiter !== "'") {
    return undefined;
  }

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
              return undefined;
            }
            value += escape;
          }
        }
        break;

      case delimiter:
        pop(src);
        return value;

      default:
        value += pop(src);
    }
  }

  throw new Error("Unexpected EOF in string starting at " + start);
}
