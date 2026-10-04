---
title:"Node.js File System (fs) Operations"
create:2026-10-04
update:2026-10-04
category:nodejs
tags:[nodejs,fs,file]
summary:"Read, write, and manage files with the built-in fs module — async and sync APIs, promises, checking existence, directories, delete/rename, and streaming large files."
top:1
copyright:true
---

# Node.js File System (fs) Operations

The `fs` (file system) module lets a Node.js program read, write, copy, move, and delete
files and directories. It is a **built-in** module, so no installation is needed.

Node offers three ways to use it, and picking the right one matters for performance:

1. **Callback API** — classic Node style.
2. **Synchronous API** — blocking; simple, but stalls the event loop.
3. **Promise API** (`fs.promises`) — modern `async`/`await`; the recommended default.

---

## Loading the Module

```javascript
const fs = require('fs');        // callback + sync APIs
const fsp = require('fs/promises'); // promise-based API (recommended)
```

Or with ES Modules:

```javascript
import fs from 'fs';
import { promises as fsp } from 'fs';
```

---

## Reading Files

### Promise API (recommended)

```javascript
const fs = require('fs/promises');

async function readFile() {
  try {
    const data = await fs.readFile('input.txt', 'utf-8');
    console.log(data);
  } catch (err) {
    console.error('Error reading file:', err.message);
  }
}

readFile();
```

The encoding `'utf-8'` is optional; without it you get a `Buffer` (raw bytes).

### Callback API

```javascript
const fs = require('fs');

fs.readFile('input.txt', 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  console.log(data);
});
```

### Synchronous API

```javascript
const fs = require('fs');

const data = fs.readFileSync('input.txt', 'utf-8');
console.log(data);
```

> ⚠️ Sync methods block the event loop. Use them only for startup/config reads; never in a
> request handler, or you stall every concurrent user.

---

## Writing Files

`writeFile` replaces the file's contents, `appendFile` adds to the end.

```javascript
const fs = require('fs/promises');

async function write() {
  await fs.writeFile('output.txt', 'Hello, Node.js!', 'utf-8');

  // Append more data
  await fs.appendFile('output.txt', '\nAppended line.\n', 'utf-8');

  console.log('File written.');
}

write();
```

To write an object as JSON:

```javascript
const user = { name: 'Ada', role: 'engineer' };
await fs.writeFile('user.json', JSON.stringify(user, null, 2), 'utf-8');
```

---

## Checking Existence & Metadata

```javascript
const fs = require('fs');

fs.exists('input.txt', (exists) => {
  console.log(exists ? 'File found' : 'File not found');
});

// Sync checks (common and cheap)
if (fs.existsSync('input.txt')) {
  const stats = fs.statSync('input.txt');
  console.log('Size:', stats.size, 'bytes');
  console.log('Is file:', stats.isFile());
  console.log('Is directory:', stats.isDirectory());
  console.log('Modified:', stats.mtime);
}
```

- `access(path, mode)` — async existence/permission check (preferred for "can I read this?").
- `accessSync(path, fs.constants.R_OK)` — checks a specific permission.

---

## Working with Directories

```javascript
const fs = require('fs/promises');

await fs.mkdir('logs', { recursive: true });   // create (recursive => no error if exists)
const files = await fs.readdir('.');            // list entries in a directory
const subdirs = (await fs.readdir('.', { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
await fs.rmdir('logs');                         // remove an EMPTY directory
await fs.rm('logs', { recursive: true, force: true }); // remove recursively (Node 14.14+)
```

- `mkdir(..., { recursive: true })` creates nested paths and is safe to call repeatedly.
- `fs.rm(path, { recursive: true, force: true })` is the modern way to delete a file or a
  whole directory tree; `force: true` ignores a missing path.

---

## Delete and Rename

```javascript
const fs = require('fs/promises');

await fs.unlink('temp.txt');                  // delete a single file
await fs.rename('old.txt', 'new.txt');        // move/rename
await fs.copyFile('src.txt', 'dest.txt');     // copy
```

---

## Reading Directory in Bulk (fs.readdir with stats)

```javascript
const fs = require('fs/promises');
const path = require('path');

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isFile()) {
      const full = path.join(dir, entry.name);
      const { size } = await fs.stat(full);
      files.push({ name: entry.name, size });
    }
  }
  return files;
}
```

---

## Streaming Large Files

`readFile`/`writeFile` load the whole file into memory. For very large files, use streams to
process them incrementally (see the Streams note for details):

```javascript
const fs = require('fs');

const readStream = fs.createReadStream('big.txt', { encoding: 'utf-8' });
const writeStream = fs.createWriteStream('copy.txt');

readStream.pipe(writeStream);

readStream.on('end', () => console.log('Copy finished.'));
readStream.on('error', (err) => console.error('Read error:', err));
```

---

## Reading a Directory Recursively (Node 20+)

Newer Node versions have `fs.glob` and `fs.promises.glob` for pattern matching. On older
versions, a small recursive helper does the job:

```javascript
const fs = require('fs/promises');
const path = require('path');

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}
```

---

## Key Takeaways

- Load with `require('fs')` (callback + sync) or `require('fs/promises')` (promise, preferred).
- `readFile(path, 'utf-8')` / `writeFile(path, data)` are the workhorses; `appendFile` adds data.
- Sync methods (`*Sync`) block the event loop — avoid them in request handlers.
- `mkdir(..., { recursive: true })` creates nested folders safely; `rm(..., { recursive: true, force: true })` deletes trees.
- `access`/`accessSync` is the proper way to test whether a path exists and is accessible.
- For big files, stream with `createReadStream`/`createWriteStream` instead of reading whole.

Next up: **the path module** — building and inspecting file paths safely across platforms.
