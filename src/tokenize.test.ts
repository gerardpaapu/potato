import { describe, it, expect } from "vitest";
import { tokenize } from "./tokenize.ts";
import { source } from "./source.ts";

const EXAMPLE =
  'value = {"__type":"NetProfit.Construct.Web.UI.Ajax.AjaxResult, NetProfit.Construct.Web.Internal, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null","IsValid":true,"Result":"","Exception":"","Data":new Data.Dictionary("System.Collections.Generic.Dictionary`2[[System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089],[System.Object, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]]",[["Start",1],["PageSize",50],["TotalCount",16],["CurrencyListJson","[]"]])};/*';

describe("example payloads to tokenize", () => {
  it("tokenizes correctly", () => {
    expect(tokenize(source(EXAMPLE))).toMatchInlineSnapshot(`
          [
            {
              "type": "IDENTIFIER",
              "value": "value",
            },
            {
              "type": "ASSIGN",
            },
            {
              "type": "OPEN_BRACE",
            },
            {
              "type": "STRING_LITERAL",
              "value": "__type",
            },
            {
              "type": "COLON",
            },
            {
              "type": "STRING_LITERAL",
              "value": "NetProfit.Construct.Web.UI.Ajax.AjaxResult, NetProfit.Construct.Web.Internal, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
            },
            {
              "type": "COMMA",
            },
            {
              "type": "STRING_LITERAL",
              "value": "IsValid",
            },
            {
              "type": "COLON",
            },
            {
              "type": "IDENTIFIER",
              "value": "true",
            },
            {
              "type": "COMMA",
            },
            {
              "type": "STRING_LITERAL",
              "value": "Result",
            },
            {
              "type": "COLON",
            },
            {
              "type": "STRING_LITERAL",
              "value": "",
            },
            {
              "type": "COMMA",
            },
            {
              "type": "STRING_LITERAL",
              "value": "Exception",
            },
            {
              "type": "COLON",
            },
            {
              "type": "STRING_LITERAL",
              "value": "",
            },
            {
              "type": "COMMA",
            },
            {
              "type": "STRING_LITERAL",
              "value": "Data",
            },
            {
              "type": "COLON",
            },
            {
              "type": "IDENTIFIER",
              "value": "new",
            },
            {
              "type": "IDENTIFIER",
              "value": "Data",
            },
            {
              "type": "DOT",
            },
            {
              "type": "IDENTIFIER",
              "value": "Dictionary",
            },
            {
              "type": "OPEN_PAREN",
            },
            {
              "type": "STRING_LITERAL",
              "value": "System.Collections.Generic.Dictionary\`2[[System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089],[System.Object, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]]",
            },
            {
              "type": "COMMA",
            },
            {
              "type": "OPEN_BRACKET",
            },
            {
              "type": "OPEN_BRACKET",
            },
            {
              "type": "STRING_LITERAL",
              "value": "Start",
            },
            {
              "type": "COMMA",
            },
            {
              "type": "NUMBER_LITERAL",
              "value": "1",
            },
            {
              "type": "CLOSE_BRACKET",
            },
            {
              "type": "COMMA",
            },
            {
              "type": "OPEN_BRACKET",
            },
            {
              "type": "STRING_LITERAL",
              "value": "PageSize",
            },
            {
              "type": "COMMA",
            },
            {
              "type": "NUMBER_LITERAL",
              "value": "50",
            },
            {
              "type": "CLOSE_BRACKET",
            },
            {
              "type": "COMMA",
            },
            {
              "type": "OPEN_BRACKET",
            },
            {
              "type": "STRING_LITERAL",
              "value": "TotalCount",
            },
            {
              "type": "COMMA",
            },
            {
              "type": "NUMBER_LITERAL",
              "value": "16",
            },
            {
              "type": "CLOSE_BRACKET",
            },
            {
              "type": "COMMA",
            },
            {
              "type": "OPEN_BRACKET",
            },
            {
              "type": "STRING_LITERAL",
              "value": "CurrencyListJson",
            },
            {
              "type": "COMMA",
            },
            {
              "type": "STRING_LITERAL",
              "value": "[]",
            },
            {
              "type": "CLOSE_BRACKET",
            },
            {
              "type": "CLOSE_BRACKET",
            },
            {
              "type": "CLOSE_PAREN",
            },
            {
              "type": "CLOSE_BRACE",
            },
            {
              "type": "SEMICOLON",
            },
            {
              "type": "EPILOGUE",
            },
          ]
        `);
  });
});
