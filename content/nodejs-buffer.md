---
title:"Node.js Buffer"
create:2026-10-04
update:2026-10-04
category:nodejs
tags:[nodejs,buffer,binary]
summary:"Work with raw binary data in Node.js — creating and converting Buffers, encodings like utf-8/base64/hex, concatenating and slicing, and reading binary files without corrupting them."
top:1
copyright:true
---

# Node.js Buffer

JavaScript strings are for text. When you work with **binary data** — images, audio, PDFs,
network packets, or any file that isn't plain text — you need `Buffer`, Node's built-in type
for raw bytes.

A `Buffer` is essentially a `Uint8Array` (an array of bytes) with extra helpers for encoding
and decoding.

---

## Creating a Buffer

```javascript
// From a string (encoded to bytes)
const buf1 = Buffer.from('Hello, Buffer!', 'utf-8');

// From an array of byte values
const buf2 = Buffer.from([72, 101, 108, 108, 111]); // "Hello"

// Allocate a zero-filled buffer of a given size
const buf3 = Buffer.alloc(1024);         // 1 KB of zeros
const buf4 = Buffer.alloc(1024, 0xff);   // 1 KB filled with 0xFF

// Allocate WITHOUT zero-filling (faster, but may contain old memory data)
const buf5 = Buffer.allocUnsafe(1024);   // ⚠️ overwrite before reading
```

> `Buffer.alloc` zeroes memory (safe). `Buffer.allocUnsafe` skips zeroing for speed — only use
> it when you immediately fill the whole buffer.

---

## Converting Back to a String

```javascript
const buf = Buffer.from('Hello, Buffer!', 'utf-8');

console.log(buf.toString());          // 'Hello, Buffer!' (utf-8 by default)
console.log(buf.toString('utf-8'));   // explicit
console.log(buf.toString('hex'));     // '48656c6c6f2c2042756666657221'
console.log(buf.toString('base64'));  // 'SGVsbG8sIEJ1ZmZlciE='
```

---

## Writing and Reading Bytes

```javascript
const buf = Buffer.alloc(5);

buf.write('abcde');            // write a string into it
console.log(buf.toString());  // 'abcde'

console.log(buf[0]);          // 97  ← byte value of 'a' (char codes are numbers)
console.log(buf.length);      // 5   ← number of BYTES
```

Use `buf.write(string, offset, length, encoding)` to write into a specific position.

---

## Useful Properties and Methods

```javascript
const buf = Buffer.from('Hello, Buffer!', 'utf-8');

buf.length;          // byte length
buf.byteOffset;      // offset within a larger buffer
buf.isBuffer();      // true
Buffer.isBuffer(buf);// true
Buffer.byteLength('hi', 'utf-8'); // 2 (bytes the string will occupy)

// Extract parts
const slice = buf.subarray(0, 5);  // first 5 bytes ('Hello') — shares memory
const copy  = Buffer.from(buf).subarray(0, 5); // independent copy

// Concatenate
const joined = Buffer.concat([Buffer.from('a'), Buffer.from('b'), Buffer.from('c')]);
console.log(joined.toString()); // 'abc'

// Compare
Buffer.from('abc').equals(Buffer.from('abc')); // true
Buffer.compare(Buffer.from('a'), Buffer.from('b')); // -1
```

> Prefer `subarray` over the legacy `slice`; `subarray` is a view (like `TypedArray`), and
> `slice` copies. If you want an independent copy, wrap in `Buffer.from(buf)`.

---

## Encodings

```javascript
const text = 'Hello, 世界';

// utf-8 (default) — universal for text
Buffer.from(text, 'utf-8');

// base64 — common for embedding binary in JSON/URLs
Buffer.from('Hello').toString('base64');       // 'SGVsbG8='
Buffer.from('SGVsbG8=', 'base64').toString();  // 'Hello'

// hex — human-readable debugging
Buffer.from('Hello').toString('hex');          // '48656c6c6f'
```

Use `base64` when you must move binary through a text-only channel (JSON APIs, data URLs).

---

## Reading a Binary File as a Buffer

This is where Buffers shine — reading a file as raw bytes without encoding loss:

```javascript
const fs = require('fs');

// Read as raw bytes (no encoding => Buffer)
const imageData = fs.readFileSync('logo.png');
console.log(imageData.length, 'bytes');

// Write bytes back out
fs.writeFileSync('copy.png', imageData);

// Convert to a data URL (useful for serving small images inline)
const mime = 'image/png';
const dataUrl = `data:${mime};base64,${imageData.toString('base64')}`;
```

**Common mistake:** reading a file with an encoding (`readFileSync(path, 'utf-8')`) and then
writing it back corrupts binary data, because invalid UTF-8 bytes get replaced. For binary,
omit the encoding so you get a `Buffer`.

---

## Buffer vs TypedArrays

`Buffer` is a subclass of `Uint8Array`, so it interoperates with typed arrays and can be sent
to/from workers and WebAssembly. Prefer `Buffer` in Node for its built-in encoding helpers;
use plain `Uint8Array` when you specifically need a fixed-width view (`Int16Array`, etc.).

---

## Key Takeaways

- `Buffer` holds raw bytes; strings are for text. Use `Buffer` for binary.
- Create with `Buffer.from(...)` (from data), `Buffer.alloc(size)` (zeroed), or `Buffer.allocUnsafe(size)` (fast, uninitialized).
- `buf.toString('hex' | 'base64' | 'utf-8')` converts bytes to a string.
- `buf.length` is in **bytes**; `buf[i]` is the numeric byte value.
- `Buffer.concat([...])` joins buffers; `subarray` views (use `Buffer.from(buf)` to copy).
- Read/write binary files **without** a text encoding to avoid corruption; base64 for text channels.

Next up: **the http module** — the low-level HTTP server and client.
