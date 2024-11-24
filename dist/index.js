// src/source.ts
function source(str) {
  return { str, idx: 0 };
}
function skipWhitespace(src) {
  while (src.idx < src.str.length && "\n	\b ".includes(src.str.charAt(src.idx))) {
    src.idx++;
  }
}
function pop(src) {
  const ch = src.str.charAt(src.idx);
  src.idx++;
  return ch;
}
function peek(src) {
  if (src.idx >= src.str.length) {
    return void 0;
  }
  return src.str.charAt(src.idx);
}

// src/result.ts
function ok(value) {
  return { ok: true, value };
}
function error(error2) {
  return { ok: false, error: error2 };
}
function bind(f, a) {
  if (!a.ok) {
    return a;
  }
  return f(a.value);
}
function compose3(f, g, h) {
  return (a) => bind(h, bind(g, f(a)));
}

// src/parse.ts
var OBJECT = 1;
var ARRAY = 2;
var FUNCALL = 3;
var PRIMITIVE = 4;
function fail(tokens, location, type) {
  const { start, end } = tokens[location];
  return error({ type, start, end });
}
function parse(tokens) {
  let [ok2, idx] = parsePrologue(tokens, 0);
  const result = parseValue(tokens, idx);
  if (!result.ok) {
    return result;
  }
  const [value, next] = result.value;
  idx = next;
  if (tokens[idx].type !== "SEMICOLON" || tokens[idx + 1].type !== "EPILOGUE") {
    return fail(tokens, idx, "MissingEpilogue");
  }
  if (tokens.length > idx + 2) {
    return fail(tokens, idx, "TrailingTokens");
  }
  return ok(ok2 ? ok(value) : error(value));
}
function parsePrologue(tokens, idx) {
  if (tokens.length > 6) {
    const [_null, semi, r, dot, error2, eq] = tokens;
    if (_null.type === "IDENTIFIER" && _null.value === "null" && semi.type === "SEMICOLON" && r.type === "IDENTIFIER" && r.value == "r" && dot.type === "DOT" && error2.type === "IDENTIFIER" && error2.value === "error" && eq.type === "ASSIGN") {
      return [false, idx + 6];
    }
  }
  return [true, idx];
}
function parseValue(tokens, idx = 0) {
  switch (tokens[idx].type) {
    case "OPEN_BRACKET":
      return parseArray(tokens, idx);
    case "OPEN_BRACE":
      return parseObject(tokens, idx);
    case "NUMBER_LITERAL":
      return ok([
        { type: PRIMITIVE, value: JSON.parse(tokens[idx].value) },
        ++idx
      ]);
    case "STRING_LITERAL":
      return ok([{ type: PRIMITIVE, value: tokens[idx].value }, ++idx]);
    case "IDENTIFIER": {
      const value = tokens[idx].value;
      if (value === "undefined") {
        return ok([{ type: PRIMITIVE, value: void 0 }, ++idx]);
      }
      if (value === "null") {
        return ok([{ type: PRIMITIVE, value: null }, ++idx]);
      }
      if (value === "true") {
        return ok([{ type: PRIMITIVE, value: true }, ++idx]);
      }
      if (value === "false") {
        return ok([{ type: PRIMITIVE, value: false }, ++idx]);
      }
      if (value === "new") {
        idx++;
        const result = parseFuncall(tokens, idx);
        if (!result.ok) {
          return result;
        }
        const [funcall, next] = result.value;
        return ok([{ ...funcall, isConstructor: true }, next]);
      }
      return parseFuncall(tokens, idx);
    }
  }
  return fail(tokens, idx, "UnexpectedToken");
}
function parseArray(tokens, idx) {
  if (tokens[idx].type !== "OPEN_BRACKET") {
    return fail(tokens, idx, "ExpectedOpenBracket");
  }
  idx++;
  const results = [];
  if (tokens[idx].type === "CLOSE_BRACKET") {
    return ok([{ type: ARRAY, value: [] }, ++idx]);
  }
  if (idx >= tokens.length) {
    return fail(tokens, idx, "UnexpectedEndOfInput");
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
  for (; ; ) {
    if (idx >= tokens.length) {
      return fail(tokens, idx, "UnexpectedEndOfInput");
    }
    if (tokens[idx].type === "CLOSE_BRACKET") {
      return ok([{ type: ARRAY, value: results }, ++idx]);
    }
    if (tokens[idx].type !== "COMMA") {
      return fail(tokens, idx, "ExpectedComma");
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
function parseObject(tokens, idx) {
  if (tokens[idx].type !== "OPEN_BRACE") {
    return fail(tokens, idx, "ExpectedOpenBrace");
  }
  idx++;
  const results = {};
  if (tokens[idx].type === "CLOSE_BRACE") {
    return ok([{ type: OBJECT, value: results }, ++idx]);
  }
  if (idx >= tokens.length) {
    return fail(tokens, idx, "UnexpectedEndOfInput");
  }
  {
    if (tokens[idx].type !== "STRING_LITERAL") {
      return fail(tokens, idx, "ExpectedStringKey");
    }
    const key = tokens[idx].value;
    idx++;
    if (tokens[idx].type !== "COLON") {
      return fail(tokens, idx, "ExpectedColon");
    }
    idx++;
    const item = parseValue(tokens, idx);
    if (!item.ok) {
      return item;
    }
    const [value, next] = item.value;
    results[key] = value;
    idx = next;
  }
  for (; ; ) {
    if (idx >= tokens.length) {
      return fail(tokens, idx, "UnexpectedEndOfInput");
    }
    if (tokens[idx].type === "CLOSE_BRACE") {
      return ok([{ type: OBJECT, value: results }, ++idx]);
    }
    if (tokens[idx].type !== "COMMA") {
      return fail(tokens, idx, "ExpectedComma");
    }
    idx++;
    if (tokens[idx].type !== "STRING_LITERAL") {
      return fail(tokens, idx, "ExpectedStringKey");
    }
    const key = tokens[idx].value;
    idx++;
    if (tokens[idx].type !== "COLON") {
      return fail(tokens, idx, "ExpectedColon");
    }
    idx++;
    const item = parseValue(tokens, idx);
    if (!item.ok) {
      return item;
    }
    const [value, next] = item.value;
    results[key] = value;
    idx = next;
  }
}
function parseFuncall(tokens, idx) {
  const names = [];
  if (tokens[idx].type !== "IDENTIFIER") {
    return fail(tokens, idx, "ExpectedFunctionName");
  }
  names.push(tokens[idx++].value);
  while (tokens[idx].type === "DOT") {
    idx++;
    if (tokens[idx].type !== "IDENTIFIER") {
      return fail(tokens, idx, "ExpectedFunctionName");
    }
    names.push(tokens[idx++].value);
  }
  const fqn = names.join(".");
  const args = [];
  if (tokens[idx].type !== "OPEN_PAREN") {
    return fail(tokens, idx, "ExpectedArgumentsList");
  }
  idx++;
  if (tokens[idx].type === "CLOSE_PAREN") {
    return ok([
      { type: FUNCALL, name: fqn, args, isConstructor: false },
      ++idx
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
  for (; ; ) {
    if (tokens[idx].type === "CLOSE_PAREN") {
      return ok([
        { type: FUNCALL, name: fqn, args, isConstructor: false },
        ++idx
      ]);
    }
    if (tokens[idx].type !== "COMMA") {
      return fail(tokens, idx, "ExpectedComma");
    }
    idx++;
    const result = parseValue(tokens, idx);
    if (!result.ok) {
      return result;
    }
    const [value, next] = result.value;
    idx = next;
    args.push(value);
  }
}

// src/tokenize.ts
function tokenize(src) {
  const tokens = [];
  skipWhitespace(src);
  for (; ; ) {
    switch (peek(src)) {
      case void 0:
        return ok(tokens);
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
        if (value == void 0) {
          return error({
            start: src.idx,
            type: "InvalidNumberLiteral"
          });
        }
        const end = src.idx;
        tokens.push({ type: "NUMBER_LITERAL", value, start, end });
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
          end
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
          end: src.idx
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
            return error({
              start: src.idx,
              type: "ExpectedAsterisk"
            });
          }
          tokens.push({ type: "EPILOGUE", start: src.idx - 2, end: src.idx });
        }
        break;
      default: {
        const start = src.idx;
        const value = readIdentifier(src);
        if (value == void 0) {
          return error({
            start: src.idx,
            type: "InvalidIdentifier"
          });
        }
        tokens.push({ type: "IDENTIFIER", value, start, end: src.idx });
      }
    }
    skipWhitespace(src);
  }
}
function readIdentifier(src) {
  const PATTERN = /[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*/uy;
  PATTERN.lastIndex = src.idx;
  const match = PATTERN.exec(src.str);
  if (match == void 0) {
    return void 0;
  }
  src.idx += match[0].length;
  return match[0];
}
function readNumberLiteral(src) {
  const PATTERN = /0|(((0\.)|([123456789]\d*))(\.\d+)?)/y;
  PATTERN.lastIndex = src.idx;
  const match = PATTERN.exec(src.str);
  if (match == void 0) {
    return void 0;
  }
  src.idx += match[0].length;
  return match[0];
}
var ESCAPES = {
  '"': '"',
  "'": "'",
  "\\": "\\",
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "	"
};
function readStringLiteral(src) {
  const delimiter = pop(src);
  if (delimiter !== '"' && delimiter !== "'") {
    return error({
      start: src.idx,
      type: "InvalidStringLiteral"
    });
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
              16
            );
            value += String.fromCharCode(code_point);
            src.idx += 4;
          } else {
            const escape = ESCAPES[code];
            if (!escape) {
              return error({
                start: src.idx,
                type: "InvalidStringLiteral"
              });
            }
            value += escape;
          }
        }
        break;
      case delimiter:
        pop(src);
        return ok(value);
      default:
        value += pop(src);
    }
  }
  return error({
    start: src.idx,
    type: "InvalidStringLiteral"
  });
}

// src/interpret.ts
function interpret(ast) {
  if (!ast.ok) {
    const r2 = extract(ast.error);
    if (!r2.ok) {
      return r2;
    }
    return { ok: false, error: r2.value };
  }
  const r = extract(ast.value);
  if (!r.ok) {
    return r;
  }
  return { ok: true, value: r.value };
}
function extract(v) {
  switch (v.type) {
    case PRIMITIVE:
      return ok(v.value);
    case ARRAY: {
      const results = [];
      for (const item of v.value) {
        const result = extract(item);
        if (!result.ok) {
          return result;
        }
        results.push(result.value);
      }
      return ok(results);
    }
    case OBJECT: {
      const results = /* @__PURE__ */ Object.create(null);
      for (const k in v.value) {
        if (k === "__proto__") {
          continue;
        }
        const result = extract(v.value[k]);
        if (!result.ok) {
          return result;
        }
        results[k] = result.value;
      }
      return ok(results);
    }
    case FUNCALL: {
      const { name, args, isConstructor } = v;
      if (name === "Data.Dictionary" && isConstructor) {
        const results = /* @__PURE__ */ new Map();
        const pairs = extract(args[1]);
        if (!pairs.ok) {
          return pairs;
        }
        for (const [key, value] of pairs.value) {
          results.set(key, value);
        }
        return ok(results);
      }
      return error({
        start: 0,
        type: "InvalidFunctionName"
      });
    }
  }
}

// src/index.ts
function read(input) {
  const read2 = compose3(tokenize, parse, interpret);
  return read2(source(input));
}
export {
  read
};
