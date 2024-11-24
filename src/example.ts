import * as Potato from "./index.ts";
import * as FS from 'node:fs/promises';

(async () => {
    const json = await FS.readFile('./src/example.json', 'utf-8');
    const output = Potato.read(json)
    console.log(output)

})().catch((e) => {
    process.exitCode = 1
    console.error(e)
})