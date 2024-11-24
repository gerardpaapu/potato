import { describe, it, expect } from 'vitest'
import { read } from "./index.ts";
describe('out of input', () => {
    it('complains about unfinished arrays', () => {
        expect(read('[1, 2')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 5,
              "start": 4,
              "type": "UnexpectedEndOfInput",
            },
            "ok": false,
          }
        `)

        expect(read('[')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 1,
              "start": 0,
              "type": "UnexpectedEndOfInput",
            },
            "ok": false,
          }
        `)

    })

    it('complains about unfinished objects', () => {
        expect(read('{')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 1,
              "start": 0,
              "type": "UnexpectedEndOfInput",
            },
            "ok": false,
          }
        `)
        expect(read('{ "1": 2,')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 9,
              "start": 8,
              "type": "UnexpectedEndOfInput",
            },
            "ok": false,
          }
        `)

        expect(read('{ "1": 2')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 8,
              "start": 7,
              "type": "UnexpectedEndOfInput",
            },
            "ok": false,
          }
        `)
    })

    it('complains about unfinished function calls', () => {
        expect(read('new Data.Dictionary(1, 2')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 24,
              "start": 23,
              "type": "UnexpectedEndOfInput",
            },
            "ok": false,
          }
        `);
    })

    it('complains about unfinished function names', () => {
        expect(read('new Data.')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 9,
              "start": 8,
              "type": "UnexpectedEndOfInput",
            },
            "ok": false,
          }
        `)
    })
})

describe('missing separators', () => {
    it('complains about missing commas in arrays', () => {
        expect(read('[1, 2 3]')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 7,
              "start": 6,
              "type": "ExpectedComma",
            },
            "ok": false,
          }
        `)
    })

    it('complains about missing colons in objects', () => {
        expect(read('{ "foo": 1, "bar" 8 }')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 19,
              "start": 18,
              "type": "ExpectedColon",
            },
            "ok": false,
          }
        `)
    })

    it('complains about missing colons in the first pair of objects', () => {
        expect(read('{ "foo" 1 }')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 9,
              "start": 8,
              "type": "ExpectedColon",
            },
            "ok": false,
          }
        `)
    })


    it('complains about missing commas in objects', () => {
        expect(read('{ "foo": 1 "bar": 8 }')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 16,
              "start": 11,
              "type": "ExpectedComma",
            },
            "ok": false,
          }
        `)
    })

    it('complains about missing keys in objects', () => {
        expect(read('{ foo: 1, "bar" 8 }')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 5,
              "start": 2,
              "type": "ExpectedStringKey",
            },
            "ok": false,
          }
        `)
        expect(read('{ "foo": 1, bar 8 }')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 15,
              "start": 12,
              "type": "ExpectedStringKey",
            },
            "ok": false,
          }
        `)
      
    })


    it('complains about missing commas in argument lists', () => {
        expect(read('new Data.Dictionary(1 2, 3)')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 23,
              "start": 22,
              "type": "ExpectedComma",
            },
            "ok": false,
          }
        `)
    })
})

describe('epilogue errors', ()=> {
    it('complains about missing epilogue', () => {
        expect(read('1')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 1,
              "start": 0,
              "type": "MissingEpilogue",
            },
            "ok": false,
          }
        `)
    })

    it('complains about tokens after the epilogue', () => {
        expect(read('1;/* 2')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 2,
              "start": 1,
              "type": "TrailingTokens",
            },
            "ok": false,
          }
        `)
    })
})

describe('errors propagate out of data structures', () => {
    it('propagates out of arrays', () => {
        expect(read('[1, 2, invalid]; /*')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 15,
              "start": 14,
              "type": "ExpectedArgumentsList",
            },
            "ok": false,
          }
        `)
        expect(read('[invalid]; /*')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 9,
              "start": 8,
              "type": "ExpectedArgumentsList",
            },
            "ok": false,
          }
        `)
    })

    it('propagates out of objects', () => {
        expect(read('{ "foo": bar }; /*')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 14,
              "start": 13,
              "type": "ExpectedArgumentsList",
            },
            "ok": false,
          }
        `)

        expect(read('{ "foo": 1, "bar": oops }; /*')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 25,
              "start": 24,
              "type": "ExpectedArgumentsList",
            },
            "ok": false,
          }
        `)
    })

    it('propagates out of argument lists', () => {
        expect(read('new Data.Dictionary(OOPS)')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 25,
              "start": 24,
              "type": "ExpectedArgumentsList",
            },
            "ok": false,
          }
        `)
        expect(read('new Data.Dictionary(1, [)')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 25,
              "start": 24,
              "type": "UnexpectedToken",
            },
            "ok": false,
          }
        `)
    })
})

describe('bad function calls', () => {
    it('expects Data.Dictionary to be called with "new"', () => {
        expect(read('Data.Dictionary(1, 2); /*')).toMatchInlineSnapshot(`
          {
            "error": {
              "start": 0,
              "type": "InvalidFunctionName",
            },
            "ok": false,
          }
        `)
    })

    it('supports only Data.Dictionary as a constructor', () => {
        expect(read('new Data.Map(1, 2); /*')).toMatchInlineSnapshot(`
          {
            "error": {
              "start": 0,
              "type": "InvalidFunctionName",
            },
            "ok": false,
          }
        `)
    })

    it('expects function names to be identifiers', () => {
        expect(read('new Data.1(1, 2);/*')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 10,
              "start": 9,
              "type": "ExpectedFunctionName",
            },
            "ok": false,
          }
        `)
    })

    it('expects arguments to follow a open parenthetical', () => {
        expect(read('new Data.Dictionary(')).toMatchInlineSnapshot(`
          {
            "error": {
              "end": 20,
              "start": 19,
              "type": "UnexpectedEndOfInput",
            },
            "ok": false,
          }
        `)
    })
})