# Vendored build tools

Copied unchanged from [JS-modules](https://github.com/lfcfoundry/JS-modules) main (MIT, Copyright (c) 2026 LFC Foundry), commit 6f5413a, 2026-10-17:

| Folder | Version |
|---|---|
| `tools/lzma-pack/` (the packer `tools/pack.py` calls) | 1.1.1 · API 1 |
| `modules/lzma-decode/` (the decoder the packer puts in the packed file, with the WebAssembly decoder, its C source and `wasm/build.sh`) | 1.1.0 · API 1 |

The two folders keep the layout JS-modules has (`tools/lzma-pack` and `modules/lzma-decode` side by side under one root) because the packer finds the decoder that way. Update by copying the same paths from JS-modules main again; do not edit them here.
