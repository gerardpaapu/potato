import { describe, it, expect } from "vitest";
import { tokenize } from "./tokenize.ts";
import { source } from "./source.ts";
import { parse } from "./parse.ts";

const EXAMPLE =
  '{"__type":"NetProfit.Construct.Web.UI.Ajax.AjaxResult, NetProfit.Construct.Web.Internal, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null","IsValid":true,"Result":"","Exception":"","Data":new Data.Dictionary("System.Collections.Generic.Dictionary`2[[System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089],[System.Object, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]]",[["Start",1],["PageSize",50],["TotalCount",16],["CurrencyListJson","[]"]])};/*';

describe("example payloads to parse", () => {
  it("parses correctly", () => {
    const tokens = tokenize(source(EXAMPLE));
    expect(parse(tokens)).toMatchInlineSnapshot(`
          {
            "ok": true,
            "value": {
              "ok": true,
              "value": {
                "type": 1,
                "value": {
                  "Data": {
                    "args": [
                      {
                        "type": 4,
                        "value": "System.Collections.Generic.Dictionary\`2[[System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089],[System.Object, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]]",
                      },
                      {
                        "type": 2,
                        "value": [
                          {
                            "type": 2,
                            "value": [
                              {
                                "type": 4,
                                "value": "Start",
                              },
                              {
                                "type": 4,
                                "value": 1,
                              },
                            ],
                          },
                          {
                            "type": 2,
                            "value": [
                              {
                                "type": 4,
                                "value": "PageSize",
                              },
                              {
                                "type": 4,
                                "value": 50,
                              },
                            ],
                          },
                          {
                            "type": 2,
                            "value": [
                              {
                                "type": 4,
                                "value": "TotalCount",
                              },
                              {
                                "type": 4,
                                "value": 16,
                              },
                            ],
                          },
                          {
                            "type": 2,
                            "value": [
                              {
                                "type": 4,
                                "value": "CurrencyListJson",
                              },
                              {
                                "type": 4,
                                "value": "[]",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    "isConstructor": true,
                    "name": "Data.Dictionary",
                    "type": 3,
                  },
                  "Exception": {
                    "type": 4,
                    "value": "",
                  },
                  "IsValid": {
                    "type": 4,
                    "value": true,
                  },
                  "Result": {
                    "type": 4,
                    "value": "",
                  },
                  "__type": {
                    "type": 4,
                    "value": "NetProfit.Construct.Web.UI.Ajax.AjaxResult, NetProfit.Construct.Web.Internal, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
                  },
                },
              },
            },
          }
        `);
  });
});
