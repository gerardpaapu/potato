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

// src/parse.ts
var OBJECT = 1;
var ARRAY = 2;
var FUNCALL = 3;
var PRIMITIVE = 4;
function fail(tokens, location, message) {
  return error({ tokens, idx: location, message });
}
function parse(tokens) {
  let idx = 0;
  let ok2 = true;
  if (tokens.length > 6) {
    const [_null, semi, r, dot, error2, eq] = tokens;
    if (_null.type === "IDENTIFIER" && _null.value === "null" && semi.type === "SEMICOLON" && r.type === "IDENTIFIER" && r.value == "r" && dot.type === "DOT" && error2.type === "IDENTIFIER" && error2.value === "error" && eq.type === "ASSIGN") {
      idx += 6;
      ok2 = false;
    }
  }
  const result = parseValue(tokens, idx);
  if (!result.ok) {
    return result;
  }
  const [value, next] = result.value;
  idx = next;
  if (tokens[idx].type !== "SEMICOLON" || tokens[idx + 1].type !== "EPILOGUE") {
    return fail(tokens, idx, "Missing epilogue");
  }
  if (tokens.length > idx + 2) {
    return fail(tokens, idx, "Trailing tokens");
  }
  return ok(ok2 ? ok(value) : error(value));
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
  return fail(tokens, idx, "Unexpected token");
}
function parseArray(tokens, idx) {
  if (tokens[idx].type !== "OPEN_BRACKET") {
    return fail(tokens, idx, "expected open bracket");
  }
  idx++;
  const results = [];
  if (tokens[idx].type === "CLOSE_BRACKET") {
    return ok([{ type: ARRAY, value: [] }, ++idx]);
  }
  if (idx >= tokens.length) {
    return fail(tokens, idx, "unexpected end of input");
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
      return fail(tokens, idx, "unexpected end of input");
    }
    if (tokens[idx].type === "CLOSE_BRACKET") {
      return ok([{ type: ARRAY, value: results }, ++idx]);
    }
    if (tokens[idx].type !== "COMMA") {
      return fail(tokens, idx, "expected comma");
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
    return fail(tokens, idx, "expected open brace");
  }
  idx++;
  const results = {};
  if (tokens[idx].type === "CLOSE_BRACE") {
    return ok([{ type: OBJECT, value: results }, ++idx]);
  }
  if (idx >= tokens.length) {
    return fail(tokens, idx, "unexpected end of input");
  }
  {
    if (tokens[idx].type !== "STRING_LITERAL") {
      return fail(tokens, idx, "expected string key");
    }
    const key = tokens[idx].value;
    idx++;
    if (tokens[idx].type !== "COLON") {
      return fail(tokens, idx, "colon");
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
      return fail(tokens, idx, "unexpected end of input");
    }
    if (tokens[idx].type === "CLOSE_BRACE") {
      return ok([{ type: OBJECT, value: results }, ++idx]);
    }
    if (tokens[idx].type !== "COMMA") {
      return fail(tokens, idx, "expected comma");
    }
    idx++;
    if (tokens[idx].type !== "STRING_LITERAL") {
      return fail(tokens, idx, "expected string key");
    }
    const key = tokens[idx].value;
    idx++;
    if (tokens[idx].type !== "COLON") {
      return fail(tokens, idx, "expected colon");
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
    return fail(tokens, idx, "expected function name");
  }
  names.push(tokens[idx++].value);
  while (tokens[idx].type === "DOT") {
    idx++;
    if (tokens[idx].type !== "IDENTIFIER") {
      return fail(tokens, idx, "expected function name");
    }
    names.push(tokens[idx++].value);
  }
  const fqn = names.join(".");
  const args = [];
  if (tokens[idx].type !== "OPEN_PAREN") {
    return fail(tokens, idx, "expected arguments list");
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
      return fail(tokens, idx, "expected comma in arguments list");
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
        if (value == void 0) {
          throw new Error("Invalid number literal");
        }
        tokens.push({ type: "NUMBER_LITERAL", value });
        break;
      }
      case '"': {
        const value = readStringLiteral(src);
        if (value == void 0) {
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
        if (value == void 0) {
          console.error(tokens);
          throw new Error(
            `invalid identifier: ${src.str.slice(src.idx, src.idx + 3)}`
          );
        }
        tokens.push({ type: "IDENTIFIER", value });
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
  const start = src.idx;
  const delimiter = pop(src);
  if (delimiter !== '"' && delimiter !== "'") {
    return void 0;
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
              return void 0;
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

// src/interpret.ts
function interpret(ast) {
  if (!ast.ok) {
    return { ok: false, error: extract(ast.error) };
  }
  return { ok: true, value: extract(ast.value) };
}
function extract(v) {
  switch (v.type) {
    case PRIMITIVE:
      return v.value;
    case ARRAY: {
      return v.value.map(extract);
    }
    case OBJECT: {
      const result = {};
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
        const result = /* @__PURE__ */ new Map();
        const pairs = args.map(extract)[1];
        for (const [key, value] of pairs) {
          result.set(key, value);
        }
        return result;
      }
      return { name, args: args.map(extract), isConstructor };
    }
  }
}

// src/index.ts
function read(input) {
  const s = source(input);
  const tokens = tokenize(s);
  const ast = parse(tokens);
  if (!ast.ok) {
    throw new Error(
      `failed to parse text: ${ast.error.message ?? "unknown error"} @ token ${ast.error.idx}`
    );
  }
  const result = interpret(ast.value);
  return result;
}
export {
  read
};
