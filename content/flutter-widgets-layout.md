---
title:"Flutter Core Widgets and Layout"
create:2026-10-04
update:2026-10-04
category:Flutter
tags:[flutter,layout,widgets]
summary:"Master Flutter's layout system — the widget tree, Row and Column flexbox, mainAxisAlignment and crossAxisAlignment, Expanded and Flexible, Stack for overlays, and Padding and Center basics."
top:1
copyright:true
---

# Flutter Core Widgets and Layout

Everything in Flutter is a **widget**, and layout is built by composing them. There is no XML
or separate layout file — you describe a **tree of widgets**, and Flutter computes the size
and position of each one. Get comfortable with the core layout widgets and you can build any
UI.

---

## Everything is a Widget

There are three kinds:

- **Description widgets** (immutable configs) — `Container`, `Padding`, `Text`, `Image`.
- **Layout widgets** — arrange their children: `Row`, `Column`, `Stack`, `Center`.
- **Paint widgets** — draw on the screen: `Container`, `Card`, `DecoratedBox`.

Widgets are **immutable configurations**. To change one you create a new widget, which is why
so much Flutter code just says "copy this widget with a different value".

---

## The Widget Tree

```dart
Center(                // parent
  child: Column(       // child
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      Text('Hello'),
      SizedBox(height: 16),
      Text('World'),
    ],
  ),
);
```

Flutter walks this tree top-down, asking each widget for its size and position, then paints.
Nesting widgets creates the visual hierarchy.

---

## Row and Column (Flexbox)

`Row` lays children out **horizontally**; `Column` **vertically**. They share the same
properties.

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start, // horizontal alignment (left/right)
  mainAxisAlignment: MainAxisAlignment.center,   // vertical alignment (top/bottom)
  mainAxisSize: MainAxisSize.min,                // take only as much space as needed
  children: [
    Text('One'),
    Text('Two'),
  ],
)
```

Swap in `Row` and `mainAxisAlignment` controls the horizontal axis instead.

### mainAxisAlignment (along the main axis)

- `start`, `end`, `center`
- `spaceBetween` — space between children
- `spaceAround` — space around each child
- `spaceEvenly` — equal space everywhere

### crossAxisAlignment (across the main axis)

- `start`, `end`, `center`
- `stretch` — force children to fill the cross axis
- `baseline` — align by text baseline

---

## SizedBox, Spacer, and Sized Constraints

The workhorse layout widgets:

```dart
Column(
  children: [
    Text('Header'),
    SizedBox(height: 16),        // fixed 16px gap
    Expanded(                     // fill the remaining space
      child: Text('Takes the rest'),
    ),
    Spacer(),                     // shorthand for Expanded(child: SizedBox())
  ],
)
```

- **`SizedBox`** — force a specific width/height.
- **`Expanded` / `Flexible`** — let a child take a share of the leftover space.
  - `Expanded` = `Flexible(fit: FlexFit.tight)` — fills all remaining space.
  - `Flexible` = `Flexible(fit: FlexFit.loose)` — takes at most its share.

### flex ratio

```dart
Row(
  children: [
    Expanded(flex: 2, child: Container(color: Colors.blue)),  // 2/3 of the row
    Expanded(flex: 1, child: Container(color: Colors.red)),   // 1/3 of the row
  ],
)
```

---

## Stack (Overlaying Widgets)

`Stack` places children on top of each other; useful for overlays, badges, and positioned
elements.

```dart
Stack(
  alignment: Alignment.bottomRight, // default position for non-positioned children
  children: [
    Image.asset('avatar.png'),
    Positioned(
      right: 8,
      top: 8,
      child: Container(
        padding: EdgeInsets.all(4),
        color: Colors.red,
        child: Text('9+', style: TextStyle(color: Colors.white)),
      ),
    ),
  ],
)
```

- `Positioned` children are placed at explicit offsets.
- The first child defines the stack's size.

---

## Padding, Center, Align

```dart
Padding(
  padding: EdgeInsets.all(16),                       // uniform
  child: Center(
    child: Text('Centered'),
  ),
)
```

- **`EdgeInsets.all(16)`** — all sides; also `.symmetric(horizontal:, vertical:)`, `.only(left:, top: ...)`, `.fromLTRB(left, top, right, bottom)`.
- **`Center`** — centers a single child in the available space (like `Align(alignment: Alignment.center)`).
- **`Align`** — positions a child within the parent's bounds.

---

## Container: The Swiss-Army Widget

`Container` bundles several common needs (padding, margin, color, border, size, alignment,
decoration):

```dart
Container(
  width: 200,
  height: 100,
  margin: EdgeInsets.all(8),
  padding: EdgeInsets.all(16),
  alignment: Alignment.center,
  decoration: BoxDecoration(
    color: Colors.blue.shade100,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: Colors.blue),
  ),
  child: const Text('Styled box'),
)
```

`Container` is convenient but under the hood it is really just a `Padding` + `Decoration` +
constraints + `Align` combined — knowing this helps you choose lighter widgets for performance.

---

## ListView (a Column in a scroll view)

```dart
ListView(
  padding: EdgeInsets.all(16),
  children: [
    ListTile(title: Text('Item 1')),
    ListTile(title: Text('Item 2')),
  ],
)
```

For long lists, use `ListView.builder` to build items lazily (see the lists & slivers note
for details).

---

## Common Layout Recipes

### Center a widget

```dart
Center(child: Text('Hi'))
```

### Two columns side by side

```dart
Row(
  children: [
    Expanded(child: Text('Left')),
    Expanded(child: Text('Right')),
  ],
)
```

### Space-between (label + value)

```dart
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  children: [Text('Total'), Text(r'\$42')],
)
```

### Circular avatar

```dart
CircleAvatar(
  radius: 24,
  backgroundImage: NetworkImage('https://example.com/avatar.png'),
)
```

---

## Key Takeaways

- Everything is a widget; layout = nesting layout widgets that position their children.
- `Row`/`Column` share flexbox: `mainAxisAlignment` (along), `crossAxisAlignment` (across).
- `SizedBox` adds fixed space; `Expanded`/`Flexible` let a child fill/share the leftover space.
- `Stack` overlays children; `Positioned` places them precisely.
- `EdgeInsets` (`.all`, `.symmetric`, `.only`) controls padding; `Container` bundles many things.
- Use `ListView`/`ListView.builder` for scrollable lists.

Next up: **StatefulWidget lifecycle** — managing state, rebuilding, and cleaning up.
