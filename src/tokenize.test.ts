import { describe, it, expect } from "vitest";
import { tokenize } from "./tokenize.ts";
import { source } from "./source.ts";

const EXAMPLE =
  'value = {"__type":"NetProfit.Construct.Web.UI.Ajax.AjaxResult, NetProfit.Construct.Web.Internal, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null","IsValid":true,"Result":"","Exception":"","Data":new Data.Dictionary("System.Collections.Generic.Dictionary`2[[System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089],[System.Object, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]]",[["Start",1],["PageSize",50],["TotalCount",16],["CurrencyListJson","[]"]])};/*';

describe("example payloads to tokenize", () => {
  it("tokenizes correctly", () => {
    expect(tokenize(source(EXAMPLE))).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": [
          {
            "end": 5,
            "start": 0,
            "type": "IDENTIFIER",
            "value": "value",
          },
          {
            "end": 7,
            "start": 6,
            "type": "ASSIGN",
          },
          {
            "end": 9,
            "start": 8,
            "type": "OPEN_BRACE",
          },
          {
            "end": 17,
            "start": 9,
            "type": "STRING_LITERAL",
            "value": "__type",
          },
          {
            "end": 18,
            "start": 17,
            "type": "COLON",
          },
          {
            "end": 151,
            "start": 18,
            "type": "STRING_LITERAL",
            "value": "NetProfit.Construct.Web.UI.Ajax.AjaxResult, NetProfit.Construct.Web.Internal, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
          },
          {
            "end": 152,
            "start": 151,
            "type": "COMMA",
          },
          {
            "end": 161,
            "start": 152,
            "type": "STRING_LITERAL",
            "value": "IsValid",
          },
          {
            "end": 162,
            "start": 161,
            "type": "COLON",
          },
          {
            "end": 166,
            "start": 162,
            "type": "IDENTIFIER",
            "value": "true",
          },
          {
            "end": 167,
            "start": 166,
            "type": "COMMA",
          },
          {
            "end": 175,
            "start": 167,
            "type": "STRING_LITERAL",
            "value": "Result",
          },
          {
            "end": 176,
            "start": 175,
            "type": "COLON",
          },
          {
            "end": 178,
            "start": 176,
            "type": "STRING_LITERAL",
            "value": "",
          },
          {
            "end": 179,
            "start": 178,
            "type": "COMMA",
          },
          {
            "end": 190,
            "start": 179,
            "type": "STRING_LITERAL",
            "value": "Exception",
          },
          {
            "end": 191,
            "start": 190,
            "type": "COLON",
          },
          {
            "end": 193,
            "start": 191,
            "type": "STRING_LITERAL",
            "value": "",
          },
          {
            "end": 194,
            "start": 193,
            "type": "COMMA",
          },
          {
            "end": 200,
            "start": 194,
            "type": "STRING_LITERAL",
            "value": "Data",
          },
          {
            "end": 201,
            "start": 200,
            "type": "COLON",
          },
          {
            "end": 204,
            "start": 201,
            "type": "IDENTIFIER",
            "value": "new",
          },
          {
            "end": 209,
            "start": 205,
            "type": "IDENTIFIER",
            "value": "Data",
          },
          {
            "end": 210,
            "start": 209,
            "type": "DOT",
          },
          {
            "end": 220,
            "start": 210,
            "type": "IDENTIFIER",
            "value": "Dictionary",
          },
          {
            "end": 221,
            "start": 220,
            "type": "OPEN_PAREN",
          },
          {
            "end": 449,
            "start": 221,
            "type": "STRING_LITERAL",
            "value": "System.Collections.Generic.Dictionary\`2[[System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089],[System.Object, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]]",
          },
          {
            "end": 450,
            "start": 449,
            "type": "COMMA",
          },
          {
            "end": 451,
            "start": 450,
            "type": "OPEN_BRACKET",
          },
          {
            "end": 452,
            "start": 451,
            "type": "OPEN_BRACKET",
          },
          {
            "end": 459,
            "start": 452,
            "type": "STRING_LITERAL",
            "value": "Start",
          },
          {
            "end": 460,
            "start": 459,
            "type": "COMMA",
          },
          {
            "end": 461,
            "start": 460,
            "type": "NUMBER_LITERAL",
            "value": "1",
          },
          {
            "end": 462,
            "start": 461,
            "type": "CLOSE_BRACKET",
          },
          {
            "end": 463,
            "start": 462,
            "type": "COMMA",
          },
          {
            "end": 464,
            "start": 463,
            "type": "OPEN_BRACKET",
          },
          {
            "end": 474,
            "start": 464,
            "type": "STRING_LITERAL",
            "value": "PageSize",
          },
          {
            "end": 475,
            "start": 474,
            "type": "COMMA",
          },
          {
            "end": 477,
            "start": 475,
            "type": "NUMBER_LITERAL",
            "value": "50",
          },
          {
            "end": 478,
            "start": 477,
            "type": "CLOSE_BRACKET",
          },
          {
            "end": 479,
            "start": 478,
            "type": "COMMA",
          },
          {
            "end": 480,
            "start": 479,
            "type": "OPEN_BRACKET",
          },
          {
            "end": 492,
            "start": 480,
            "type": "STRING_LITERAL",
            "value": "TotalCount",
          },
          {
            "end": 493,
            "start": 492,
            "type": "COMMA",
          },
          {
            "end": 495,
            "start": 493,
            "type": "NUMBER_LITERAL",
            "value": "16",
          },
          {
            "end": 496,
            "start": 495,
            "type": "CLOSE_BRACKET",
          },
          {
            "end": 497,
            "start": 496,
            "type": "COMMA",
          },
          {
            "end": 498,
            "start": 497,
            "type": "OPEN_BRACKET",
          },
          {
            "end": 516,
            "start": 498,
            "type": "STRING_LITERAL",
            "value": "CurrencyListJson",
          },
          {
            "end": 517,
            "start": 516,
            "type": "COMMA",
          },
          {
            "end": 521,
            "start": 517,
            "type": "STRING_LITERAL",
            "value": "[]",
          },
          {
            "end": 522,
            "start": 521,
            "type": "CLOSE_BRACKET",
          },
          {
            "end": 523,
            "start": 522,
            "type": "CLOSE_BRACKET",
          },
          {
            "end": 524,
            "start": 523,
            "type": "CLOSE_PAREN",
          },
          {
            "end": 525,
            "start": 524,
            "type": "CLOSE_BRACE",
          },
          {
            "end": 526,
            "start": 525,
            "type": "SEMICOLON",
          },
          {
            "end": 528,
            "start": 526,
            "type": "EPILOGUE",
          },
        ],
      }
    `);
  });
});
