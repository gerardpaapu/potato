# Potato

We still have a bunch of AjaxPro methods in XeroWeb and every time we unwrap them we use eval, which is evil, but also uneccesary.

The format of AjaxPro is basically a weird dialect of JSON and we can parse it like JSON more or less.

```js
import * as Potato from '@xero/potato'

const example1 = Potato.read('{ Data: new Data.Dictionary("Type.Gore", [["key", "value"]])}/*')

example1.ok // true
example1.Data.get('key') // value


const example2 = Potato.read('null; r.error = { Message: "COMPUTER SAD" }/*')

example2.ok // false
example2.Message // 'COMPUTER SAD'
```

