---
title:"Flutter StatefulWidget and the Widget Lifecycle"
create:2026-10-04
update:2026-10-04
category:Flutter
tags:[flutter,state,lifecycle]
summary:"Understand how StatefulWidget works — createState, the full lifecycle callbacks, setState and rebuilds, when state is preserved or lost, and how to dispose resources properly."
top:1
copyright:true
---

# Flutter StatefulWidget and the Widget Lifecycle

Most real Flutter apps need to change over time — a counter increments, data loads, a form is
submitted. That requires **state**, and the `StatefulWidget` + `State` pair is how Flutter
manages it. Understanding the lifecycle is essential for writing correct, leak-free Flutter
apps.

---

## StatelessWidget vs StatefulWidget

A **StatelessWidget** is immutable — its UI depends only on its configuration, which never
changes. A **StatefulWidget** can rebuild when its internal `State` changes.

```dart
// Stateless — no state, no rebuilds
class Greeting extends StatelessWidget {
  final String name;
  const Greeting({super.key, required this.name});

  @override
  Widget build(BuildContext context) {
    return Text('Hello, $name');
  }
}
```

```dart
// Stateful — holds mutable state that can change
class Counter extends StatefulWidget {
  const Counter({super.key});

  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('Count: $_count'),
        ElevatedButton(
          onPressed: () => setState(() => _count++),
          child: const Text('Increment'),
        ),
      ],
    );
  }
}
```

The `State` object lives in a separate class (`_CounterState`) and survives rebuilds.

---

## The Lifecycle

A `State` moves through these callbacks:

### 1. createState()

Instantiated once when the widget is inserted. Initialize state here (but don't touch the
context-dependent stuff yet).

### 2. mounted

A boolean property — `state.mounted` tells you whether the widget is still in the tree. **Always
check it after an `await`**, because the user might have navigated away.

### 3. initState()

Called once, right after the widget is inserted, before the first build. Perfect for one-time
setup: controllers, listeners, initial API calls.

```dart
@override
void initState() {
  super.initState();               // always call super first
  _controller = TextEditingController();
  _loadData();                     // kick off async work
}
```

### 4. didChangeDependencies()

Called after `initState` and whenever an inherited widget the state depends on changes. Use
`Theme.of(context)` / `MediaQuery` here (not in `initState`).

### 5. build()

Called whenever the widget needs to (re)render — initially and after every `setState`. **Return
a widget; never do heavy work or side effects here.** Keep it pure and fast.

```dart
@override
Widget build(BuildContext context) {
  if (_loading) return const CircularProgressIndicator();
  return ListView.builder(itemCount: _items.length, itemBuilder: ...);
}
```

### 6. didUpdateWidget(oldWidget)

Called when the **parent rebuilds and provides a new** instance of the same `StatefulWidget`
(its configuration changed but the `State` is reused). React to config changes here.

```dart
@override
void didUpdateWidget(covariant MyWidget oldWidget) {
  super.didUpdateWidget(oldWidget);
  if (oldWidget.userId != widget.userId) {
    _loadData(); // reload for the new id
  }
}
```

### 7. deactivate / dispose

- `deactivate()` — the widget is being removed from the tree (rarely overridden).
- **`dispose()`** — the `State` is permanently destroyed. **Clean up here**: cancel timers,
  stop streams, dispose controllers, remove listeners.

```dart
@override
void dispose() {
  _controller.dispose();
  _timer?.cancel();
  super.dispose();
}
```

> Forgetting `dispose` for controllers, timers, or subscriptions is one of the most common
> sources of memory leaks and "setState() called after dispose" errors in Flutter.

---

## setState — Triggering a Rebuild

`setState` tells Flutter "my state changed, rebuild this widget":

```dart
setState(() {
  _count++;          // mutate state INSIDE the callback
});
```

Rules:
- **Mutate state inside the `setState` callback** (so the change is captured atomically).
- Call it from event handlers, async callbacks, etc. — not from inside `build`.
- `setState` only rebuilds **this** `State` (and anything below that depends on it).

### setState with async

```dart
Future<void> _load() async {
  setState(() { _loading = true; });
  final data = await fetchData();
  if (!mounted) return;        // ← must check: user may have left
  setState(() {
    _data = data;
    _loading = false;
  });
}
```

> Always guard with `if (!mounted) return;` after an `await` before calling `setState`.

---

## When State is Preserved vs Lost

The `State` is kept as long as the widget sits at the **same position in the tree** with the
same `key`. It is **disposed and recreated** if the widget moves, is removed, or its type
changes.

Two techniques manage this deliberately:

- **`GlobalKey`** — gives a widget a unique identity, so its `State` survives moves/reordering.
- **Automatic `Key`s (ValueKey/ObjectKey/UniqueKey)** — help Flutter match state correctly in
  lists that reorder.

```dart
// A GlobalKey lets you access the State of a widget from elsewhere
final formKey = GlobalKey<FormState>();
Form(key: formKey, child: ...);
formKey.currentState!.validate();
```

---

## Full Lifecycle Example

```dart
class TimerPage extends StatefulWidget {
  const TimerPage({super.key});
  @override
  State<TimerPage> createState() => _TimerPageState();
}

class _TimerPageState extends State<TimerPage> {
  int _seconds = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _seconds++);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();   // must stop the timer or it leaks
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(child: Text('$_seconds s', style: Theme.of(context).textTheme.headlineMedium));
  }
}
```

---

## Key Takeaways

- `StatefulWidget` + `State` hold mutable state; `setState` triggers a rebuild.
- Lifecycle: `initState` → `didChangeDependencies` → `build` → (repeat) → `dispose`.
- `initState` = one-time setup; `dispose` = cleanup (cancel timers, dispose controllers).
- `build` must stay fast and side-effect-free; never do async work directly in it.
- Check `if (!mounted) return;` after every `await` before `setState`.
- State is preserved only if the widget stays at the same position with the same key.

Next up: **Navigation** — moving between screens with the Navigator.
