import { describe, it, expect } from "vitest";
import { read, readValue } from './index.ts'

const EXAMPLE =
  '{"__type":"NetProfit.Construct.Web.UI.Ajax.AjaxResult, NetProfit.Construct.Web.Internal, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null","IsValid":true,"Result":"","Exception":"","Data":new Data.Dictionary("System.Collections.Generic.Dictionary`2[[System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089],[System.Object, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]]",[["Start",1],["PageSize",50],["TotalCount",16],["CurrencyListJson","[]"]])};/*';

describe("example payloads to interpret", () => {
  it("interprets correctly", () => {
    const result = read(EXAMPLE)
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
    const result = readValue(json) 

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

  it("reads a basic object", () => {
    expect(read('{ "foo": 1};/*')).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": {
          "foo": 1,
        },
      }
    `);
  });

  it("omits __proto__ keys", () => {
    expect(read('{ "__proto__": 1 }; /*')).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": {},
      }
    `);
  });

  it("reads an error payload", () => {
    expect(read('null; r.error = { "foo": "bar" };/*'))
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
    expect(read("[undefined, null, true, false, 0];/*"))
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
    expect(read('"\\u2665\\t\\n";/*')).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": "♥	
      ",
      }
    `);
  });

  it("reads empty arrays", () => {
    expect(read("[];/*")).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": [],
      }
    `);
  });

  it("reads empty objects", () => {
    expect(read("{};/*")).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": {},
      }
    `);
  });

  it("propagates syntax errors", () => {
    expect(read("[;/*")).toMatchInlineSnapshot(`
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
    expect(read("null; r.error = new Data.Oops();/*"))
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
    expect(read("[new Data.Oops()]; /*")).toMatchInlineSnapshot(`
      {
        "error": {
          "start": 0,
          "type": "InvalidFunctionName",
        },
        "ok": false,
      }
    `);

    expect(read('{ "foo": new Data.Ooops() };/*'))
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
