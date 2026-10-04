---
title:"Node.js Modules: The CommonJS System"
create:2026-10-04
update:2026-10-04
category:nodejs
tags:[nodejs,modules,commonjs]
summary:"How Node.js loads code — require, module.exports, the exports alias, module caching, path resolution and the main field, plus a first look at ES Modules."
top:1
copyright:true
---

# Node.js Modules: The CommonJS System

Node.js does not run one giant file. It splits your program into **modules** — self-contained
files you `require` and export from. Understanding the module system is the foundation for
everything else in Node: organizing code, using npm packages, and reading any library's source.

This note covers the classic **CommonJS** system (`require` / `module.exports`), how Node
resolves a path, module caching, and a brief look at the modern **ES Modules** (`import` /
`export`) alternative.

---

## Why Modules?

- **Encapsulation** — each file has its own scope; variables do not leak into the global space.
- **Reuse** — a function written once can be shared across many files and projects.
- **Organization** — split a growing program into focused, maintainable pieces.
- **The npm ecosystem** — every published package is just a module you install and require.

---

## Loading a Module: require

Use `require` to load another file (or a package) and get back whatever it exports:

```javascript
// Load a user-defined file (note the .js extension is optional)
const math = require('./math');
console.log(math.add(2, 3)); // 5

// Load a built-in Node module (no path needed)
const http = require('http');
const fs = require('fs');

// Load a package installed via npm
const express = require('express');
```

- `'./math'` → relative to the **current** file.
- `'../shared/util'` → parent directory.
- `'express'` → a package from `node_modules` (or a built-in like `http`/`fs`).

`require` returns the value stored in the exporting file's `module.exports`.

---

## Exporting: module.exports and exports

A module exposes its public API through `module.exports`. By default it starts as an empty
object; you attach things to it.

**math.js** — the module you want to share:

```javascript
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// Attach functions to module.exports so consumers can access them
module.exports = {
  add,
  subtract,
};
```

**app.js** — the consumer:

```javascript
const math = require('./math');
console.log(math.add(10, 5));      // 15
console.log(math.subtract(10, 5)); // 5
```

### The `exports` shorthand

`exports` is a convenience alias that initially points at the same object as `module.exports`.
You can attach properties to it without touching `module.exports` directly:

```javascript
// greet.js
exports.hello = function () {
  return 'Hello, World!';
};
```

```javascript
// app.js
const greet = require('./greet');
console.log(greet.hello()); // Hello, World!
```

### The classic pitfall: reassigning `exports`

`exports` is only a reference. If you **reassign** it (`exports = ...`), you break the link
to `module.exports` and the consumer gets `{}`:

```javascript
// ✗ WRONG — exports is reassigned; module.exports is never updated
exports = { hello: () => 'hi' };

// ✓ RIGHT — mutate the object, or reassign module.exports
module.exports = { hello: () => 'hi' };
```

**Rule of thumb:** use `module.exports = { ... }` for a single object; use `exports.foo = ...`
only when you are *adding* properties and never reassign `exports`.

---

## How Node Resolves the Path

When you call `require('./math')`, Node walks the filesystem to find the file. It tries, in
order:

1. The exact path — `./math` → `math` (file), `math.js`, `math.json`, `math.node`.
2. `./math/` as a directory — looks for `package.json` and reads its `main` field; if absent,
   falls back to `index.js` inside that directory.
3. For bare names like `require('express')` — search `node_modules` directories walking **up**
   from the current file, then check global folders and built-ins.

The `main` field in `package.json` tells Node the entry file of a package:

```json
{
  "name": "my-lib",
  "version": "1.0.0",
  "main": "lib/index.js"
}
```

If `main` is missing, Node looks for `index.js`.

---

## Module Caching

Every module is loaded and executed **only once** per process. Node caches the returned
`module.exports` and reuses it on subsequent `require` calls:

```javascript
const a = require('./counter');
const b = require('./counter');

console.log(a === b); // true — same object from the cache
```

Because of caching, requiring a module **twice does not re-run its top-level code**. To force
a fresh copy, delete the cache entry first (rarely needed, mostly in tests):

```javascript
delete require.cache[require.resolve('./counter')];
const fresh = require('./counter');
```

---

## Built-in vs User Modules

- **Built-in** modules ship with Node and are referenced by name: `http`, `fs`, `path`,
  `os`, `events`, `stream`, `url`, `crypto`, `util`. No installation needed.
- **User/third-party** modules live in `node_modules` and are installed with npm.

To see every built-in module available in your Node version:

```bash
node -p "process.builtinModules"
```

---

## ES Modules (the modern alternative)

Node also supports **ECMAScript Modules** — the same `import`/`export` syntax you see in
browsers. Enable them by setting the type in `package.json`:

```json
{
  "type": "module"
}
```

```javascript
// calc.mjs (or .js when "type": "module")
export function add(a, b) {
  return a + b;
}

export const PI = 3.14159;

// Default export
export default function greet(name) {
  return `Hi, ${name}`;
}
```

```javascript
// main.mjs
import greet, { add, PI } from './calc.mjs';
console.log(add(2, 3), PI, greet('Ada'));
```

Key differences from CommonJS:

| Feature | CommonJS | ES Modules |
| --- | --- | --- |
| Load | `require()` | `import` |
| Export | `module.exports` | `export` |
| Top-level `await` | No | Yes |
| Load timing | Synchronous, at runtime | Static, hoisted |
| File extension | Optional | Usually required |
| `this` at top level | `module.exports` | `undefined` |

**Which to use?** New projects commonly use ES Modules; much of the older npm ecosystem still
ships CommonJS. Both work side by side in a project — a `.mjs` file is always ESM, a `.cjs`
file is always CommonJS, and `.js` follows the `type` field in `package.json`.

---

## Key Takeaways

- `require('./x')` loads a module; it returns the exporting file's `module.exports`.
- `module.exports = { ... }` defines the public API; `exports.foo = ...` adds to it.
- Never reassign `exports` — it breaks the reference and yields `{}` on the consumer side.
- Node caches modules, so each file runs once per process.
- Path resolution follows the file, then `main`/`index.js` in a package, then `node_modules`.
- Node supports both CommonJS (`require`) and ES Modules (`import`).

Next up: **npm and package.json** — managing dependencies and running scripts.
