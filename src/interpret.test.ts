import { describe, it, expect } from 'vitest';
import { tokenize } from './tokenize.ts';
import { source } from './source.ts';
import { parse } from './parse.ts';
import { interpret } from './interpret.ts';
import { compose3 } from './result.ts';

const EXAMPLE =
  '{"__type":"NetProfit.Construct.Web.UI.Ajax.AjaxResult, NetProfit.Construct.Web.Internal, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null","IsValid":true,"Result":"","Exception":"","Data":new Data.Dictionary("System.Collections.Generic.Dictionary`2[[System.String, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089],[System.Object, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089]]",[["Start",1],["PageSize",50],["TotalCount",16],["CurrencyListJson","[]"]])};/*';

describe('example payloads to interpret', () => {
  it('interprets correctly', () => {
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
});
