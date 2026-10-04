---
title:"Flutter Navigation with the Navigator"
create:2026-10-04
update:2026-10-04
category:Flutter
tags:[flutter,navigation,routing]
summary:"Move between screens in Flutter — push and pop, named routes, passing arguments between routes, onGenerateRoute, and awaiting a result from a pushed screen."
top:1
copyright:true
---

# Flutter Navigation with the Navigator

A multi-screen app needs **navigation** — moving from a home screen to a detail screen and
back. Flutter handles this with the **Navigator**, a stack-based route manager built into the
framework.

---

## The Navigator and Route Stack

The Navigator maintains a **stack** of `Route` objects. The screen on top is the visible one.
`push` adds a route, `pop` removes the top one.

```dart
Navigator.of(context).push(
  MaterialPageRoute(builder: (context) => const DetailScreen()),
);
Navigator.of(context).pop();
```

Every app has a root `Navigator` set up by `MaterialApp` (or `CupertinoApp` / `WidgetsApp`).

---

## Navigating Between Screens

```dart
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const DetailScreen()),
            );
          },
          child: const Text('Go to detail'),
        ),
      ),
    );
  }
}
```

- **`MaterialPageRoute`** — the standard Material transition (slide/fade up). Use
  `CupertinoPageRoute` for iOS-style, `PageRouteBuilder` for custom transitions.
- `context` is passed to `push` so the Navigator knows where in the tree to operate.

---

## Named Routes

For apps with a known set of screens, register route **names** on `MaterialApp`:

```dart
MaterialApp(
  initialRoute: '/',
  routes: {
    '/': (context) => const HomeScreen(),
    '/detail': (context) => const DetailScreen(),
    '/settings': (context) => const SettingsScreen(),
  },
);
```

Push and pop by name:

```dart
Navigator.pushNamed(context, '/detail');
Navigator.popNamed(context, '/settings');
```

Named routes keep navigation calls out of your widget tree, making screens reusable and the
route table easy to audit in one place.

---

## Passing Arguments Between Routes

### Constructor (recommended for type safety)

Define a route that takes required parameters:

```dart
class DetailScreen extends StatelessWidget {
  final String title;
  final int id;

  const DetailScreen({super.key, required this.title, required this.id});

  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: Text(title)), body: Text('ID: $id'));
  }
}
```

Pass them directly:

```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (_) => DetailScreen(title: 'Item', id: 42),
  ),
);
```

### Named route with arguments

```dart
// In routes:
routes: {
  '/detail': (context) {
    final args = ModalRoute.of(context)!.settings.arguments as DetailArgs;
    return DetailScreen(title: args.title, id: args.id);
  },
},
```

```dart
// Navigating:
Navigator.pushNamed(
  context,
  '/detail',
  arguments: DetailArgs(title: 'Item', id: 42),
);
```

> Passing a class (like `DetailArgs`) or plain values is fine, but avoid passing a `BuildContext`
> or `State` — it can break if the source screen is disposed.

---

## Getting a Result Back (await)

`push` returns a `Future` that completes with whatever the popped route `pop`s with. This is
great for "pick something, then use it":

```dart
final result = await Navigator.push<String>(
  context,
  MaterialPageRoute(builder: (_) => const PickColorScreen()),
);

if (result != null && mounted) {
  setState(() => _chosenColor = result);
}
```

```dart
// In PickColorScreen, send the choice back:
Navigator.of(context).pop('red'); // result becomes 'red'
```

Use the result for dialogs, date pickers, and selection screens.

---

## onGenerateRoute (dynamic routes)

For parameterized URLs (e.g. `/user/42`), use `onGenerateRoute` to parse the path:

```dart
MaterialApp(
  onGenerateRoute: (settings) {
    final uri = Uri.parse(settings.name!);
    final segments = uri.pathSegments;

    if (segments.length == 2 && segments[0] == 'user') {
      final id = int.parse(segments[1]);
      return MaterialPageRoute(builder: (_) => UserScreen(id: id));
    }
    return null; // fall through to 404
  },
);
```

```dart
Navigator.pushNamed(context, '/user/42');
```

---

## Popping and Preventing Accidental Exits

Pop the top route:

```dart
Navigator.of(context).pop();
Navigator.maybePop(context); // pops only if it CAN (e.g., not the last route)
```

Intercept the back button (Android) or app-bar back:

```dart
PopScope(
  canPop: false,
  onPopInvokedWithResult: (didPop, result) {
    if (!didPop) {
      // show a confirm dialog, then pop manually if confirmed
    }
  },
  child: const MyScreen(),
);
```

This is how you prompt "Discard changes?" when the user tries to go back.

---

## Tabs and Nested Navigators

For bottom-tab apps, each tab often keeps its own navigation stack using a nested `Navigator`
or the common `IndexedStack` pattern (which preserves each tab's state as you switch). This
keeps a user deep in tab A's history when they return to it.

---

## Key Takeaways

- The `Navigator` is a **stack**: `push` adds a screen, `pop` removes the top one.
- `MaterialPageRoute` is the default transition; pass a `builder` to construct the screen.
- `MaterialApp.routes` + `pushNamed` = named routes; keep the route table in one place.
- Pass data via the screen's constructor (type-safe) or via `settings.arguments` (named routes).
- `await Navigator.push<T>(...)` returns a result the pushed screen `pop`s with.
- `onGenerateRoute` parses dynamic paths like `/user/42`; `PopScope` guards the back action.

Next up: **Lists and Slivers** — building fast, lazy scrolling views.
