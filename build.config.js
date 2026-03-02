// @ts-check

import { build } from 'esbuild'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'build/index.js',
    platform: 'node',
    format: 'esm',
    target: 'esnext',
    treeShaking: true,
    minify: true,
    sourcemap: false,
    packages: 'external',
    alias: {
        '@': path.resolve(__dirname, 'src'),
        "@env": path.resolve(__dirname, "./env.config.ts")
    },
    external: ['node:*'],
}).then(() => {
    console.log(`Build complete`)
}).catch((err) => {
    console.error(err)
    process.exit(1)
})