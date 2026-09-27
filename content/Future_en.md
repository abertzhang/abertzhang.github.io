---
title:Future class
create:2026-09-27
update:2026-09-27
category:Flutter
tags:[async,Future]
summary:
top:1
copyright:true
---
### Class Future

```
dart:core // core library
dart:async library
abstract class Future<T>
Implementers: DelegatingFuture SynchronousFuture TickerFuture
```

#### Inheritance

```
// subclasses implement: Implementers
DelegatingFutureSynchronousFutureTickerFuture
// extensions: Available Extensions
FutureExtensions
```

#### Constructors

```dart
// in the event queue
Future(FutureOr<T> computation())
  // event queue
Future.delayed(Duration duration, [FutureOr<T> computation()])
Future.error(Object error, [StackTrace? stackTrace])
  // microtask queue; also scheduleMicrotask() and _completed.then()
Future.microtask(FutureOr<T> computation())
// runs immediately
Future.sync(FutureOr<T> computation())
  // runs immediately
Future.value([FutureOr<T>? value])
// _.then() also runs immediately
```

#### Methods

```dart
asStream() → Stream<T>
catchError(Function onError, {bool test(Object error)}) → Future<T>
then<R>(FutureOr<R> onValue(T value), {Function? onError}) → Future<R>
timeout(Duration timeLimit, {FutureOr<T> onTimeout()}) → Future<T>
whenComplete(FutureOr<void> action()) → Future<T>
```

#### Static Methods

```
any<T>(Iterable<Future<T>> futures) → Future<T>
doWhile(FutureOr<bool> action()) → Future
orEach<T>(Iterable<T> elements, FutureOr action(T element)) → Future
wait<T>(Iterable<Future<T>> futures, {bool eagerError: false, void cleanUp(T successValue)}) → Future<List<T>>
```

### Class Completer

Separates the Future's functionality

#### Constructors

```
Completer()
Completer.sync()
```

#### Properties

```
future → Future<T>
isCompleted → bool
```

#### Methods

```
complete([FutureOr<T>? value]) → void
completeError(Object error, [StackTrace? stackTrace]) → void
```

#### Usage

```
// separates Future error/completion cases
class AsyncOperation {
  final Completer _completer = new Completer();

  Future<T> doOperation() {
    _startOperation();
    return _completer.future; // Send future object back to client.
  }

  // Something calls this when the value is ready.
  void _finishOperation(T result) {
    _completer.complete(result);
  }

  // If something goes wrong, call this.
  void _errorHappened(error) {
    _completer.completeError(error);
  }
}
```

### Class FutureOr<T>

```
// The `Future<T>.then` function takes a callback [f] that returns either
// an `S` or a `Future<S>`.
Future<S> then<S>(FutureOr<S> f(T x), ...);

// `Completer<T>.complete` takes either a `T` or `Future<T>`.
void complete(FutureOr<T> value);
```

### Class FutureGroup<T>

[Official Docs](https://api.flutter.dev/flutter/async/FutureGroup-class.html)

### Example - Priority Order - 01

```dart
import 'dart:async';
void main() {
  Future x0 = Future(() => null);
  Future x = Future(() => print('1'));
  Future(() => print('2'));
  scheduleMicrotask(() => print('3'));
  x.then((value) {
    print('4');
    Future(() => print('5'));
  }).then((value) => print('6'));
  print('7');
  x0.then((value) {
    print('8');
    scheduleMicrotask(() {
      print('9');
    });
  }).then((value) => print('10'));
}
//
7
3
8
10
9
1
4
6
2
5
```

### Example - Verify Execution Order - 02

```dart
import 'dart:async';
void main() {
  Future.delayed(Duration.zero, () => print('event_2'));
  Future(() => print('event_1'));
  scheduleMicrotask(() => print('micro_1'));
  Future.microtask(() => print('micro_2'));
  Future.value(12).then((value) => print('micro_3'));
  print('main_1');
  Future.sync(() => print('sync_1'));
  getName();
  print('main_2');
}

String getName() {
  print('getName_inside_value');
  return 'name';
}
//
main_1
sync_1
getName_inside_value
main_2
micro_1
micro_2
micro_3
event_2
event_1
```

### Example - Verify `then` Runs Immediately - 01

```dart
import 'dart:async';
void main() {
  Future.delayed(Duration(seconds: 1), () => print('delayed')).then((value) {
    scheduleMicrotask(() => print('mirco'));
    print('then_1');
  }).then((value) => print('then_2'));
}
//
elayed
then_1
then_2
mirco
```

### Example - Future.wait

```dart
void main() {
  Future.wait([
    Future(() {
      print('task_1');
      return "task_1";
    }),
    Future(() {
      Future.delayed(Duration(seconds: 1));
      print('task_2');
      return "task_2";
    }),
  ]).then((value) {
    // note: value is now an array
    print('then: arrived: ${value[0]} + ${value[1]}');
    print('task_3');
  });
}
//
task_1
task_2
then: arrived: task_1 + task_2
task_3
```

### References

[Official Docs](https://api.flutter.dev/flutter/dart-async/Future-class.html)

[Flutter: Event Queue, Microtask Queue, and Multithreading](https://www.cnblogs.com/zyzmlc/p/14088880.html)
