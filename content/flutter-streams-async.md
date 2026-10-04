---
title:"Dart Streams and Async Data Flow"
create:2026-10-04
update:2026-10-04
category:Flutter
tags:[flutter,dart,stream,async]
summary:"Go beyond Future with Dart Stream — single-subscription vs broadcast streams, listen and StreamController, async and await for, reactive widgets, and where streams fit in Flutter."
top:1
copyright:true
---

# Dart Streams and Async Data Flow

A `Future` gives you **one** value, later. A `Stream` gives you **many** values, over time —
exactly what you need for reactive data: WebSocket messages, file-download progress, a search
box firing on every keystroke, or database change notifications.

This note is the companion to the `Future` note and covers `Stream` in depth.

---

## Stream Basics

A Stream is an asynchronous sequence of events. You consume it with `listen`, and events can
arrive over any period of time.

```dart
// A stream from a periodic timer
Stream<int> counterStream() async* {
  for (int i = 0; i < 5; i++) {
    await Future.delayed(const Duration(seconds: 1));
    yield i; // emit one value
  }
}

void main() {
  final sub = counterStream().listen(
    (value) => print('Got: $value'),
    onError: (e) => print('Error: $e'),
    onDone: () => print('Stream closed'),
  );
  // sub.cancel(); // stop listening early
}
```

- `async*` + `yield` is the cleanest way to **create** a stream.
- `listen` registers callbacks for `data` / `onError` / `onDone`.

---

## Single-Subscription vs Broadcast

### Single-subscription (default)

Can be listened to **once**. Most streams (file reads, HTTP bodies) are single-subscription.

```dart
final stream = File('data.txt').readAsLines(); // single-subscription
stream.listen((line) => print(line));
```

### Broadcast

Can have **many** listeners simultaneously. Useful for app-wide events (user logged in, theme
changed). Create with `StreamController.broadcast()`.

```dart
final controller = StreamController<String>.broadcast();

controller.stream.listen((v) => print('A got $v'));
controller.stream.listen((v) => print('B got $v'));

controller.add('hello'); // both listeners receive it
```

Listen for the **current** value too (instead of only future ones):

```dart
final behavior = StreamBehavior.broadcast(); // replay latest
```

---

## Creating Streams: StreamController

A `StreamController` is the programmatic way to build a stream you push values into:

```dart
void main() {
  final controller = StreamController<String>();

  // Add values asynchronously
  controller.add('first');
  controller.add('second');

  // Finish the stream
  controller.close();

  controller.stream.listen(print); // prints: first, second
}
```

### single-subscription controller

```dart
final controller = StreamController<int>();
controller.stream.listen((v) => print(v));
controller.add(1);
controller.addError('something failed'); // emit an error
controller.close();
```

### Add vs await

- `controller.add(value)` — send a value now.
- `await controller.addStream(otherStream)` — pipe another stream's events into this one.
- `await controller.close()` — signal done (important for cleanup).

---

## Consuming Streams

### listen

```dart
stream.listen(
  (data) => print(data),
  onError: (Object error) => print('Error: $error'),
  onDone: () => print('Done'),
  cancelOnError: false, // keep listening after an error
);
```

The `listen` call returns a `StreamSubscription` — store it and `cancel()` it when done, or
set `autoCancel` for fire-and-forget use.

### await for

`await for` consumes a stream in an async loop — very readable:

```dart
Future<void> consume() async {
  await for (final line in File('data.txt').readAsLines()) {
    print(line);
  }
}

consume();
```

### Transforming: map, where, expand

Streams have rich operators before you even listen:

```dart
final upper = nameStream.map((s) => s.toUpperCase());
final long = numbers.where((n) => n > 10);
final flat = streams.expand((s) => s); // flatten nested streams
final combined = merge(streamA, streamB);
```

### fold / reduce

Aggregate a stream into a single value (like `Future.wait` but streaming):

```dart
final total = numbers.fold<int>(0, (sum, n) => sum + n);
```

---

## Async/Await and Futures vs Streams

| | Future | Stream |
| --- | --- | --- |
| Values | exactly one | zero, one, or many |
| Wait for | `await future` | `await for` / `listen` |
| Started | on creation | lazily, on listen |
| Cancel | no (it completes) | yes, `subscription.cancel()` |

Rule of thumb:
- **One result later** (network call, read file) → `Future` + `async/await`.
- **Many results over time** (events, progress, live updates) → `Stream`.

They interoperate: a `Stream` can be converted to a Future of its first value with
`.first`, and Futures can be turned into single-value streams with `Stream.fromFuture`.

---

## Streams in Flutter

### StreamBuilder (the key widget)

`StreamBuilder` subscribes to a stream and rebuilds on each event — the standard way to show
live data:

```dart
StreamBuilder<int>(
  stream: counterStream(),
  builder: (context, snapshot) {
    if (snapshot.hasError) {
      return Text('Error: ${snapshot.error}');
    }
    if (snapshot.connectionState == ConnectionState.waiting) {
      return const CircularProgressIndicator();
    }
    return Text('Count: ${snapshot.data}');
  },
)
```

`snapshot` exposes `data`, `error`, and `connectionState` (`waiting` / `active` / `done`).

### Reactive value (like a lightweight provider)

```dart
class Counter {
  final _controller = StreamController<int>.broadcast();
  int _value = 0;

  Stream<int> get stream => _controller.stream;
  int get value => _value;

  void increment() {
    _value++;
    _controller.add(_value);
  }

  void dispose() => _controller.close();
}
```

Wrap it in a `StreamBuilder` (or an `InheritedWidget`) and any listening widget updates
automatically — reactivity without rebuilding the whole app.

---

## Key Takeaways

- `Stream` delivers **many** events over time; `Future` delivers **one** value.
- Create with `async*` + `yield`, or push values with a `StreamController`.
- Single-subscription (once) vs broadcast (many listeners) — know which you need.
- Consume with `listen`, or read cleanly with `await for`; `StreamBuilder` wires streams to UI.
- Transform with `map`, `where`, `expand`, `fold`, and `merge`.
- Always `close()` controllers and `cancel()` subscriptions to avoid leaks.

Next up: applying this async foundation to a full feature, or dive into state management.
