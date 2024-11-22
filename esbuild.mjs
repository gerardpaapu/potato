import * as esbuild from 'esbuild'

await esbuild.build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outdir: 'dist',
    color: true,
    logLevel: 'info'
})