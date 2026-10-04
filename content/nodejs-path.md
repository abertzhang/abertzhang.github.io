---
title:"Node.js path Module"
create:2026-10-04
update:2026-10-04
category:nodejs
tags:[nodejs,path,utilities]
summary:"Build and inspect filesystem paths portably — join vs resolve, basename, extname, dirname, parse/format, path separators, and the __dirname and __filename globals."
top:1
copyright:true
---

# Node.js path Module

The `path` module provides utilities for working with file and directory paths. Because paths
use different separators on Windows (`\`) and POSIX (`/`), you should **never** build paths by
concatenating strings with `/`. The `path` module handles those differences for you.

```javascript
const path = require('path');
```

---

## Key Globals: __dirname and __filename

Two variables are available in every CommonJS module:

- **`__dirname`** — the absolute directory path of the current file.
- **`__filename`** — the absolute path of the current file (including its name).

```javascript
// app.js
console.log(__filename); // /home/user/my-app/app.js
console.log(__dirname);  // /home/user/my-app
```

They are extremely handy for resolving files relative to your project rather than to the
terminal's current directory (which can differ between local runs and a deployed server).

In ES Modules the equivalents are `import.meta.dirname` / `import.meta.filename` (Node 20.11+)
or `fileURLToPath(import.meta.url)`.

---

## Joining Segments: path.join vs path.resolve

Both combine segments into a full path, but they differ in how they treat a leading slash.

### `path.join` — concatenate

```javascript
path.join('/home', 'user', 'app.js');   // '/home/user/app.js'
path.join('foo', '..', 'bar');          // normalizes '..' => 'bar'
```

### `path.resolve` — resolve against a base

`path.resolve` walks from the **rightmost** segment leftward until it produces an absolute
path; if none is absolute it prepends the current working directory.

```javascript
path.resolve('/home', 'user', 'app.js'); // '/home/user/app.js'
path.resolve('app.js');                   // '/current/working/dir/app.js' (uses cwd)
path.resolve('/home', '/etc', 'app.js'); // '/etc/app.js'  ← earlier absolute segment resets
```

**Rule of thumb:** use `join` to build a path from known pieces; use `resolve` when you need a
guaranteed absolute path (e.g. against `__dirname`).

```javascript
// Robustly resolve a file next to your script
const configPath = path.resolve(__dirname, 'config.json');
```

---

## Extracting Parts

```javascript
const p = '/home/user/docs/report.pdf';

path.basename(p);        // 'report.pdf'      ← last portion
path.basename(p, '.pdf'); // 'report'        ← without the extension
path.extname(p);         // '.pdf'            ← extension, including the dot
path.dirname(p);         // '/home/user/docs' ← all but the last portion
```

---

## parse and format

`path.parse` returns an object describing a path in one call; `path.format` builds a path
back from such an object.

```javascript
const info = path.parse('/home/user/report.pdf');
/*
{
  root: '/',
  dir: '/home/user',
  base: 'report.pdf',
  ext: '.pdf',
  name: 'report'
}
*/

const rebuilt = path.format({
  dir: '/home/user',
  base: 'report.pdf',
});
// '/home/user/report.pdf'
```

---

## Normalizing and Relative Paths

```javascript
path.normalize('/home/user/../admin/./docs'); // '/home/admin/docs'

path.relative('/home/user', '/home/user/docs/report.pdf');
// 'docs/report.pdf'   ← how to get from one path to another
```

---

## Platform-Specific Info

```javascript
path.sep;        // path separator: '/' on POSIX, '\\' on Windows
path.delimiter;  // PATH variable separator: ':' on POSIX, ';' on Windows
```

You rarely hardcode these; letting `path` handle them keeps your code portable.

---

## Typical Use Cases

```javascript
const path = require('path');
const fs = require('fs/promises');

// Build a path inside your project
const dataDir = path.join(__dirname, 'data');
const filePath = path.join(dataDir, 'users.json');

// Serve a static file by absolute path (Express)
app.get('/download', (req, res) => res.sendFile(path.resolve(__dirname, 'files/report.pdf')));

// Join a URL-safe web path (not a filesystem path)
const webPath = path.posix.join('/static', 'images', 'logo.png'); // '/static/images/logo.png'
```

> Note: for **web** paths (URLs), prefer `path.posix` (always `/`) or a URL helper. For
> **filesystem** paths use the default `path`, which adapts to the running OS.

---

## Key Takeaways

- Always use `path.join`/`path.resolve` instead of string concatenation with `/`.
- `__dirname`/`__filename` give the current file's absolute location.
- `join` concatenates; `resolve` guarantees an absolute path (prepending cwd if needed).
- `basename`, `extname`, `dirname` extract the parts of a path; `parse`/`format` do it in bulk.
- `normalize` cleans up `..`/`.`; `relative` computes the path between two locations.
- For URL building use `path.posix` so separators stay `/` everywhere.

Next up: **the events module** — building event-driven Node applications.
