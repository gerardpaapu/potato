import { describe, it, expect } from "vitest";
import { tokenize } from "./tokenize.ts";
import { source } from "./source.ts";
import { parse, parseValue } from "./parse.ts";
import { interpret, interpretValue } from "./interpret.ts";
import { compose, compose3 } from "./result.ts";
import exp from "constants";

const EXAMPLE =
  '{"__type":"NetProfit.Construct.Web.UI.Ajax.AjaxResult, NetProfit.Construct.Web.Internal, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null","IsValid":true,"Result":"","Exception":"","Data":new Data.Dictionary("System.Collections.Generic.Dictionary`2[[System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089],[System.Object, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]]",[["Start",1],["PageSize",50],["TotalCount",16],["CurrencyListJson","[]"]])};/*';

describe("example payloads to interpret", () => {
  it("interprets correctly", () => {
    const result = compose3(tokenize, parse, interpret)(source(EXAMPLE));
    expect(result).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": {
          "Data": Map {
            "Start" => 1,
            "PageSize" => 50,
            "TotalCount" => 16,
            "CurrencyListJson" => "[]",
          },
          "Exception": "",
          "IsValid": true,
          "Result": "",
          "__type": "NetProfit.Construct.Web.UI.Ajax.AjaxResult, NetProfit.Construct.Web.Internal, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
        },
      }
    `);
  });

  it('can read a currency list', () => {
    const json = `[{"__type":"","key":"CURR/CAD","value":0.830149,"html":null,"data":new Data.Dictionary("",[["DateTime","12 Nov 2024"],["ProviderName","XE.com"],["EnteredByUserName",""]])},{"__type":"","key":"CURR/JPY","value":91.6308,"html":null,"data":new Data.Dictionary("",[["DateTime","12 Nov 2024"],["ProviderName","XE.com"],["EnteredByUserName",""]])}]`
    // const result = compose3(tokenize, parseValue, interpretValue)(source(json));
    const tokens = tokenize(source(json))
    if (!tokens.ok) {
      expect.fail()
      return
    }
    const ast = parseValue(tokens.value)
    if (!ast.ok) {
      expect.fail()
      return
    }

    const [value] = ast.value
    const result = interpretValue(value) 

    expect(result).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": [
          {
            "__type": "",
            "data": Map {
              "DateTime" => "12 Nov 2024",
              "ProviderName" => "XE.com",
              "EnteredByUserName" => "",
            },
            "html": null,
            "key": "CURR/CAD",
            "value": 0.830149,
          },
          {
            "__type": "",
            "data": Map {
              "DateTime" => "12 Nov 2024",
              "ProviderName" => "XE.com",
              "EnteredByUserName" => "",
            },
            "html": null,
            "key": "CURR/JPY",
            "value": 91.6308,
          },
        ],
      }
    `)

  })
});

describe("an object", () => {
  const read = compose3(tokenize, parse, interpret);

  it("reads a basic object", () => {
    expect(read(source('{ "foo": 1};/*'))).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": {
          "foo": 1,
        },
      }
    `);
  });

  it("omits __proto__ keys", () => {
    expect(read(source('{ "__proto__": 1 }; /*'))).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": {},
      }
    `);
  });

  it("reads an error payload", () => {
    expect(read(source('null; r.error = { "foo": "bar" };/*')))
      .toMatchInlineSnapshot(`
      {
        "error": {
          "foo": "bar",
        },
        "ok": false,
      }
    `);
  });

  it("reads primitives", () => {
    expect(read(source("[undefined, null, true, false, 0];/*")))
      .toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": [
          undefined,
          null,
          true,
          false,
          0,
        ],
      }
    `);
  });
  it("reads weird strings", () => {
    expect(read(source('"\\u2665\\t\\n";/*'))).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": "♥	
      ",
      }
    `);
  });

  it("reads empty arrays", () => {
    expect(read(source("[];/*"))).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": [],
      }
    `);
  });

  it("reads empty objects", () => {
    expect(read(source("{};/*"))).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": {},
      }
    `);
  });

  it("propagates syntax errors", () => {
    expect(read(source("[;/*"))).toMatchInlineSnapshot(`
      {
        "error": {
          "end": 2,
          "start": 1,
          "type": "UnexpectedToken",
        },
        "ok": false,
      }
    `);
  });

  it("manages errors thrown within error responses", () => {
    expect(read(source("null; r.error = new Data.Oops();/*")))
      .toMatchInlineSnapshot(`
      {
        "error": {
          "start": 0,
          "type": "InvalidFunctionName",
        },
        "ok": false,
      }
    `);
  });

  it("manages errors from within collections", () => {
    expect(read(source("[new Data.Oops()]; /*"))).toMatchInlineSnapshot(`
      {
        "error": {
          "start": 0,
          "type": "InvalidFunctionName",
        },
        "ok": false,
      }
    `);

    expect(read(source('{ "foo": new Data.Ooops() };/*')))
      .toMatchInlineSnapshot(`
      {
        "error": {
          "start": 0,
          "type": "InvalidFunctionName",
        },
        "ok": false,
      }
    `);
  });
});
