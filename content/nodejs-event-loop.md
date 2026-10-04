---
title:"The Node.js Event Loop and Async Execution"
create:2026-10-04
update:2026-10-04
category:nodejs
tags:[nodejs,event-loop,async]
summary:"How Node.js schedules asynchronous work — the event loop phases, timers vs I/O vs microtasks, process.nextTick vs Promise ordering, and avoiding the blocking main thread."
top:1
copyright:true
---

# The Node.js Event Loop and Async Execution

Node.js runs JavaScript on a single thread, yet handles thousands of concurrent network
requests. This works because of the **event loop** — a mechanism that schedules I/O and
callbacks so the single thread never sits idle waiting, and never processes two callbacks at
the same time.

Understanding the event loop explains ordering surprises, helps you avoid blocking the
process, and is core interview/interview-adjacent knowledge for backend work.

---

## The Mental Model

Your code runs top-to-bottom on the main thread. When it hits an async operation (a timer, a
file read, an HTTP request), Node hands the work to an internal thread pool and **continues**
running your remaining synchronous code. When the operation completes, its callback is queued
on the event loop. The event loop then picks queued callbacks up — one at a time — and runs
them. No two callbacks ever run concurrently, but while one waits on I/O the thread is free to
do other work.

---

## Event Loop Phases

Each turn of the event loop processes a set of phases, in order:

1. **Timers** — callbacks from `setTimeout` / `setInterval` whose time has come.
2. **Pending callbacks** — some deferred I/O callbacks (e.g. `process.nextTick` queue is
   handled between phases in modern Node, but the classic "pending" bucket sits here).
3. **Poll** — retrieve new I/O events; execute I/O callbacks. This is where most of your
   async callbacks (file reads, network) run.
4. **Check (setImmediate)** — callbacks registered with `setImmediate` run here.
5. **Close callbacks** — e.g. `socket.on('close', ...)`.

Between phases, Node also drains the **microtask queue**: all pending Promises and
`process.nextTick` callbacks. So a Promise chain started in one phase can run to completion
before the loop moves to the next phase.

---

## Microtasks: nextTick vs Promise

Two queues can run "soon" callbacks, with a strict priority order:

1. **`process.nextTick`** — runs **before** Promises, after the current operation completes.
2. **Promise callbacks (`.then`)** — run after all `nextTick` callbacks.

```javascript
console.log('1: sync start');

setTimeout(() => console.log('5: setTimeout (macrotask)'), 0);

Promise.resolve().then(() => console.log('4: promise (microtask)'));
process.nextTick(() => console.log('3: nextTick (runs before promises)'));

console.log('2: sync end');

// Output order:
// 1: sync start
// 2: sync end
// 3: nextTick (runs before promises)
// 4: promise (microtask)
// 5: setTimeout (macrotask)
```

**Takeaway:** if you need something to run *immediately after* the current operation but
before other async work, `process.nextTick` is the tool (use it sparingly — too many starve
I/O).

---

## setTimeout vs setImmediate Ordering

At the **top level** (main module), `setTimeout(…, 0)` and `setImmediate(…, 0)` are
non-deterministic — their order can vary. But **inside an I/O callback**, `setImmediate`
always runs **before** `setTimeout`:

```javascript
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => console.log('setTimeout'), 0);
  setImmediate(() => console.log('setImmediate'));
  // Always: setImmediate, then setTimeout
});
```

The I/O callback runs in the **poll** phase; `setImmediate` fires in the very next **check**
phase, while `setTimeout(0)` is clamped to ~1ms and may not be ready until the following turn.

---

## Blocking the Event Loop

Anything synchronous and slow (a big loop, a synchronous file read, heavy JSON parsing) blocks
the single thread — freezing **all** concurrent requests. Example of a 3-second block:

```javascript
// ✗ BAD — blocks the entire event loop for ~3 seconds
let count = 0;
while (count < 1e9) count++;
```

### How to avoid blocking

1. **Chunk heavy work** — break it into pieces with `setImmediate`:

```javascript
function processArray(arr) {
  let i = 0;
  function step() {
    const start = Date.now();
    while (i < arr.length && Date.now() - start < 50) {
      // do a chunk of work (< 50ms)
      i++;
    }
    if (i < arr.length) {
      setImmediate(step); // yield, then continue
    } else {
      console.log('Done');
    }
  }
  step();
}
```

2. **Use async I/O** — `fs.promises.readFile` instead of `readFileSync`.
3. **Offload to workers** — `worker_threads` or child processes for CPU-heavy tasks.
4. **Be mindful in request handlers** — a slow synchronous step delays every user.

---

## CPU-bound vs I/O-bound

- **I/O-bound** (network, disk, most web work) — Node's async model is ideal. Multiple
  operations progress concurrently on one thread.
- **CPU-bound** (encryption, image processing, huge computations) — blocks the thread. Move
  it to `worker_threads` so the event loop stays free.

---

## Key Takeaways

- The event loop runs async callbacks in phases: timers → poll (I/O) → check (`setImmediate`) → close.
- Microtasks (`process.nextTick`, then Promises) run between phases, before the next phase.
- `process.nextTick` beats `Promise.then` in ordering.
- Inside an I/O callback, `setImmediate` runs before `setTimeout(0)`.
- Synchronous heavy work blocks the single thread — chunk it, use async APIs, or use worker threads.
- Match your approach to the work: async I/O for I/O-bound, workers for CPU-bound.

Next up: **streams** — processing large data efficiently without loading it all into memory.
