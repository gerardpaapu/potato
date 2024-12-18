# Potato

We still have a bunch of AjaxPro methods in XeroWeb and every time we unwrap them we use eval, which is evil, but also uneccesary.

The format of AjaxPro is basically a weird dialect of JSON and we can parse it like JSON more or less.

```js
import * as Potato from '@donothing/potato'

const example1 = Potato.read('{ Data: new Data.Dictionary("Type.Gore", [["key", "value"]])}/*')

example1.ok // true
example1.data.Data.get('key') // value


const example2 = Potato.read('null; r.error = { Message: "COMPUTER SAD" }/*')

example2.ok // false
example2.error.Message // 'COMPUTER SAD'

// readValue doesn't expect the '/*' at the end or the 'null; r.error = '
// at the start
const example3 = Potato.readValue('{ Data: new Data.Dictionary("Type.Gore", [["key", "value"]])}')
example3.ok // true
example3.data.Data.get('key') // value
```

