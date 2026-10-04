---
title:"Node.js events and EventEmitter"
create:2026-10-04
update:2026-10-04
category:nodejs
tags:[nodejs,events,eventemitter]
summary:"The event-driven core of Node.js — creating an EventEmitter, listening with on/once/off, emitting events, the special error event, and when not to use events."
top:1
copyright:true
---

# Node.js events and EventEmitter

Node.js is **event-driven** at its core: many core objects (HTTP servers, file streams,
child processes) are `EventEmitter`s that emit named events, and your code reacts by
listening. Understanding events is key to writing idiomatic Node applications.

The `events` module exposes the `EventEmitter` class:

```javascript
const { EventEmitter } = require('events');
```

---

## Creating and Using an EventEmitter

```javascript
const { EventEmitter } = require('events');

const myEmitter = new EventEmitter();

// Listen for the 'greet' event
myEmitter.on('greet', (name) => {
  console.log(`Hello, ${name}!`);
});

// Fire (emit) the event
myEmitter.emit('greet', 'Ada');
// Output: Hello, Ada!
```

- `.on(event, listener)` — run `listener` every time `event` is emitted.
- `.emit(event, ...args)` — trigger `event`, passing arguments to each listener.

---

## once — Run Only the First Time

`.once` registers a listener that automatically removes itself after firing once:

```javascript
const { EventEmitter } = require('events');
const ee = new EventEmitter();

ee.once('ready', () => console.log('Ready fired (once).'));

ee.emit('ready'); // logs
ee.emit('ready'); // does NOT log — listener already removed
```

Great for one-time initialization, or as the starting point for a promise (see below).

---

## Removing Listeners

```javascript
const { EventEmitter } = require('events');
const ee = new EventEmitter();

function handler(msg) {
  console.log(msg);
}

ee.on('ping', handler);

ee.off('ping', handler);        // remove a specific listener (Node 10+)
ee.removeListener('ping', handler); // older alias

ee.removeAllListeners('ping');  // remove all listeners for an event
ee.removeAllListeners();        // remove ALL listeners (use with care!)
```

`off`, `removeListener`, and `once` are the ones you reach for most; `removeAllListeners`
is a blunt instrument best avoided outside shutdown paths.

---

## The Special error Event

`EventEmitter` treats the `'error'` event specially: **emitting `'error'` with no registered
listener throws the error** (crashing the process by default). This is intentional — it stops
silent failures.

```javascript
const { EventEmitter } = require('events');
const ee = new EventEmitter();

// Always attach an 'error' listener, or emitting 'error' will throw.
ee.on('error', (err) => {
  console.error('Something went wrong:', err.message);
});

ee.emit('error', new Error('disk full')); // handled, no crash
```

If you extend `EventEmitter`, always emit `'error'` on failures and always provide a listener.

---

## Passing Multiple Arguments to Listeners

`emit` forwards all its arguments to every listener:

```javascript
const { EventEmitter } = require('events');
const ee = new EventEmitter();

ee.on('sum', (a, b) => console.log(a + b));
ee.emit('sum', 2, 3); // 5
```

---

## Turning an Event into a Promise

A common pattern is to await a one-time event (e.g. a stream finishing). Wrap it with
`events.once` (Node 11+) or a manual `once` + `Promise`:

```javascript
const { once } = require('events');

const ee = new EventEmitter();

function doWork() {
  setTimeout(() => ee.emit('done', 'result'), 100);
}

async function main() {
  const [result] = await once(ee, 'done'); // resolves with emitted args
  console.log(result); // 'result'
}

doWork();
main();
```

---

## Passing a Callback-Style Function

A frequent integration pattern: adapt a callback-based Node API into a promise-friendly one
using `once`:

```javascript
const fs = require('fs');
const { once } = require('events');

const ee = new EventEmitter();

fs.readFile('data.txt', (err, data) => {
  if (err) ee.emit('error', err);
  else ee.emit('data', data);
});

// Await it like a promise
const [data] = await once(ee, 'data');
```

---

## Extending EventEmitter

You can make your own objects emit events by extending `EventEmitter`:

```javascript
const { EventEmitter } = require('events');

class Job extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
  }

  start() {
    this.emit('start', this.name);
    setTimeout(() => this.emit('done', this.name), 50);
  }
}

const job = new Job('import');
job.on('start', (n) => console.log(`${n} started`));
job.on('done', (n) => console.log(`${n} finished`));
job.start();
```

---

## When NOT to Use Events

- **Simple, linear logic** — plain function calls are clearer than an event bus.
- **Many listeners (>10) for one event** — Node prints a `MaxListenersExceededWarning`;
  usually a sign the design should be refactored.
- **You need ordering guarantees** — events fire synchronously in registration order, but
  async listeners run concurrently, so ordering is not guaranteed for async work.

---

## Key Takeaways

- `EventEmitter` is the base of Node's event-driven model: `.on` listens, `.emit` fires.
- `.once` runs a listener only the first time; `.off`/`removeListener` remove listeners.
- Emitting `'error'` without a listener **throws** — always attach one.
- `events.once(emitter, 'event')` converts a one-time event into an awaitable promise.
- Extend `EventEmitter` to make custom objects emit events.
- Prefer events for decoupling many-to-many notifications, not for simple step-by-step code.

Next up: **the event loop** — how Node actually schedules all of this asynchronously.
