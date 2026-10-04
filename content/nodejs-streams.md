---
title:"Node.js Streams"
create:2026-10-04
update:2026-10-04
category:nodejs
tags:[nodejs,stream,io]
summary:"Process data incrementally with Node.js streams — readable, writable, duplex and transform streams, piping, flowing mode, backpressure, and reading/writing large files without blowing memory."
top:1
copyright:true
---

# Node.js Streams

A **stream** is an object that lets you read or write data **incrementally** — chunk by
chunk — instead of loading an entire file or payload into memory at once. Streams are the
idiomatic way Node handles I/O: reading big files, serving HTTP bodies, and piping data
through transformations.

All stream classes live in the built-in `stream` module.

---

## The Four Stream Types

| Type | Purpose | Example |
| --- | --- | --- |
| **Readable** | Source you consume | reading a file, HTTP response |
| **Writable** | Sink you write to | writing a file, HTTP request |
| **Duplex** | Both readable and writable | TCP sockets |
| **Transform** | Duplex that transforms data on the fly | `zlib.createGzip()` |

---

## Readable Streams: Consuming Data

### From a file

```javascript
const fs = require('fs');

const readStream = fs.createReadStream('big.txt', { encoding: 'utf-8' });

readStream.on('data', (chunk) => {
  console.log('Received chunk:', chunk.length, 'chars');
});
readStream.on('end', () => {
  console.log('Finished reading.');
});
readStream.on('error', (err) => {
  console.error('Read error:', err);
});
```

Key events:
- **`data`** — a chunk arrived (this puts the stream in *flowing mode*).
- **`end`** — no more data will come.
- **`error`** — something went wrong (always handle it).
- **`open` / `close`** — underlying resource opened / closed.

### Consuming with async iteration (cleanest)

```javascript
const fs = require('fs');

async function process() {
  const readStream = fs.createReadStream('big.txt', { encoding: 'utf-8' });
  for await (const chunk of readStream) {
    // process each chunk as it arrives
  }
  console.log('Done.');
}

process();
```

`for await...of` is the modern, readable way to consume a readable stream.

### In paused mode with read()

```javascript
const readStream = fs.createReadStream('big.txt');
readStream.pause();
readStream.read(); // manually pull a chunk
```

---

## Writable Streams: Writing Data

```javascript
const fs = require('fs');

const writeStream = fs.createWriteStream('output.txt', { encoding: 'utf-8' });

writeStream.write('Hello, ');
writeStream.write('Stream!');
writeStream.end();   // ← important: signals you're done

writeStream.on('finish', () => console.log('All data flushed to disk.'));
```

- `write(chunk)` — send data to the stream.
- `end(chunk?)` — optional final chunk, then close the stream.
- `finish` — all data has been written and flushed.

---

## Piping: Connecting Streams

The most common use of streams: `pipe` one stream's output directly into another's input,
so data flows automatically without buffering it all in between.

```javascript
const fs = require('fs');

// Copy a large file efficiently
const readStream = fs.createReadStream('big.txt');
const writeStream = fs.createWriteStream('copy.txt');
readStream.pipe(writeStream);

writeStream.on('finish', () => console.log('Copy complete.'));
```

### Transform streams in a pipeline

A transform stream sits in the middle and converts the data passing through:

```javascript
const fs = require('fs');
const zlib = require('zlib'); // built-in, provides gzip Transform streams

const readStream = fs.createReadStream('big.txt');
const gzipStream = zlib.createGzip();
const writeStream = fs.createWriteStream('big.txt.gz');

// data: plain text -> gzipped -> file
readStream.pipe(gzipStream).pipe(writeStream);

writeStream.on('finish', () => console.log('Compressed.'));
```

### pipeline — safer chaining

`stream.pipeline` propagates errors and cleans up properly (preferred over manual `.pipe`):

```javascript
const { pipeline } = require('stream/promises');
const fs = require('fs');
const zlib = require('zlib');

await pipeline(
  fs.createReadStream('big.txt'),
  zlib.createGzip(),
  fs.createWriteStream('big.txt.gz')
);
console.log('Compressed without leaks.');
```

---

## Backpressure

If the writable side is slower than the readable side, a naive `pipe` buffers unbounded data
in memory. **Backpressure** is Node's mechanism to pause the readable stream when the
writable buffer fills up, then resume it when drained.

Writable streams signal readiness with `write()`'s return value (`false` = buffer full):

```javascript
readStream.on('data', (chunk) => {
  if (!writeStream.write(chunk)) {
    readStream.pause();              // buffer full — stop reading
    writeStream.once('drain', () => {
      readStream.resume();           // drained — continue
    });
  }
});
```

`pipe()` handles this automatically for you; manual `on('data') + write()` is where you handle
it yourself.

---

## Object Mode (optional)

By default streams carry Buffers/strings. In **object mode**, each "chunk" can be any JS
value — handy for custom pipelines:

```javascript
const { Readable } = require('stream');

const numbers = Readable.from([1, 2, 3, 4, 5], { objectMode: true });
numbers.on('data', (n) => console.log(n * 2));
```

---

## Key Takeaways

- Streams process data **incrementally** — essential for large files and payloads.
- Readable = source, Writable = sink, Duplex = both, Transform = duplex that transforms.
- `readStream.pipe(writeStream)` connects streams; `pipe(...).pipe(...)` builds pipelines.
- Use `stream.pipeline` (or `stream/promises.pipeline`) for error-safe chaining.
- Handle `data`, `end`, `error` on readable streams; `finish` on writable ones.
- Backpressure keeps memory in check — automatic with `pipe`, manual with `write()`.
- `for await...of` is the cleanest way to consume a readable stream.

Next up: **Buffer** — handling raw binary data.
