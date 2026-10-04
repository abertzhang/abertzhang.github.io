---
title:"Flutter Lists and Slivers"
create:2026-10-04
update:2026-10-04
category:Flutter
tags:[flutter,listview,sliver,performance]
summary:"Build fast scrolling lists in Flutter — ListView.builder for lazy lists, ListView.separated, reverse and horizontal lists, and CustomScrollView with slivers for combined scrolling."
top:1
copyright:true
---

# Flutter Lists and Slivers

Displaying a long list is one of the most common Flutter tasks — and one of the easiest to
get wrong. Building every row up front can freeze the app; building them lazily keeps it
smooth. This note covers the right tools.

---

## Never Build Every Row at Once

A naive `Column` inside a `SingleChildScrollView` with 10,000 children builds all 10,000
widgets immediately — slow to load and memory-hungry. Instead use a **lazy** list that builds
rows only as they scroll into view.

---

## ListView.builder — The Workhorse

`ListView.builder` takes an `itemCount` and an `itemBuilder` that is called only for the rows
currently visible (plus a small cache).

```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    final item = items[index];
    return ListTile(
      title: Text(item.title),
      subtitle: Text(item.subtitle),
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => DetailScreen(item: item)),
      ),
    );
  },
)
```

- `items` might contain 10,000 entries, but only a handful of widgets exist at any moment.
- `itemBuilder` is re-invoked for rows as they scroll into view — keep each row's build cheap.

---

## ListView.separated — Add Dividers

Same lazy building, but the builder also gets the **index**, so you can render a separator
between items:

```dart
ListView.separated(
  itemCount: items.length,
  separatorBuilder: (context, index) => const Divider(height: 1),
  itemBuilder: (context, index) => ListTile(title: Text(items[index].title)),
)
```

---

## Other Useful ListView Options

### With headers and footers

```dart
ListView(
  children: [
    const ListTile(title: Text('Header')),
    ...items.map((i) => ListTile(title: Text(i.title))), // list of widgets (small lists only)
    const ListTile(title: Text('Footer')),
  ],
)
```

### Horizontal list

```dart
ListView.builder(
  scrollDirection: Axis.horizontal, // scroll sideways
  itemCount: categories.length,
  itemBuilder: (context, i) => Padding(
    padding: const EdgeInsets.all(8),
    child: Chip(label: Text(categories[i])),
  ),
)
```

### Reverse (chat apps)

```dart
ListView.builder(
  reverse: true, // newest item appears at the bottom, anchored like a chat
  itemCount: messages.length,
  itemBuilder: (context, i) {
    final msg = messages[messages.length - 1 - i]; // reverse index
    return MessageBubble(msg);
  },
)
```

### Padding and physics

```dart
ListView(
  padding: const EdgeInsets.all(16),
  physics: const AlwaysScrollableScrollPhysics(),
  itemCount: items.length,
  itemBuilder: ...,
)
```

---

## CustomScrollView and Slivers

A **sliver** is a lazy section of a scrollable built on the same "build only what's visible"
principle. `CustomScrollView` lets you **combine** different slivers into one scroll — e.g. a
fixed app bar, a header card, then a lazy list, all scrolling together.

```dart
CustomScrollView(
  slivers: [
    // A pinned app bar that stays while scrolling
    SliverAppBar(
      title: const Text('Feed'),
      floating: true,
      pinned: true,
      expandedHeight: 200,
      flexibleSpace: FlexibleSpaceBar(
        background: Image.network('https://example.com/banner.jpg', fit: BoxFit.cover),
      ),
    ),
    // A small non-lazy header
    SliverToBoxAdapter(
      child: Padding(padding: const EdgeInsets.all(16), child: Text('${items.length} items')),
    ),
    // The lazy list
    SliverList.builder(
      itemCount: items.length,
      itemBuilder: (context, i) => ListTile(title: Text(items[i].title)),
    ),
  ],
)
```

Useful slivers:

- **`SliverAppBar`** — flexible/pinned app bar (collapses on scroll).
- **`SliverList`** — a lazy list of children.
- **`SliverGrid`** — a lazy grid.
- **`SliverToBoxAdapter`** — wrap a single (non-lazy) widget as a sliver child.
- **`SliverFillRemaining`** — fill the rest of the viewport (great for empty/short lists).
- **`SliverPersistentHeader`** — a header that can pin/scroll.

### Empty state with SliverFillRemaining

```dart
CustomScrollView(
  slivers: [
    SliverFillRemaining(
      hasScrollBody: false,
      child: Center(child: Text('No items yet')),
    ),
  ],
)
```

---

## Performance Tips

- **Use lazy builders** (`ListView.builder`, `SliverList.builder`) for anything that could be large.
- **Keep `itemBuilder` cheap** — avoid heavy computation or network calls per row.
- **Add `const` constructors** wherever possible to allow widget reuse (skip rebuilds).
- **Provide `keys`** for items that reorder (`ValueKey(item.id)`).
- **Avoid nested scrollables** — a `ListView` inside a `ListView` hurts performance; consider
  `shrinkWrap` only for small nested lists, or use a single `CustomScrollView`.
- **Use `itemExtent` / `prototypeItem`** when rows have a fixed height — lets the list skip
  measuring and scroll even smoother.

---

## Keys for Stable List Items

When a list can reorder or delete items, give each row a stable key so Flutter matches state
to the right widget:

```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, i) => ListTile(
    key: ValueKey(items[i].id), // stable identity
    title: Text(items[i].title),
  ),
)
```

This prevents the classic "text jumps to the wrong row after deletion" bug.

---

## Key Takeaways

- Never build a huge `Column`; use `ListView.builder` (or `.separated`) to build rows lazily.
- `itemBuilder` runs only for visible rows — keep it cheap and use `const` where possible.
- `CustomScrollView` + slivers combine a pinned `SliverAppBar`, headers, and a lazy `SliverList` in one scroll.
- `SliverFillRemaining(hasScrollBody: false)` is the clean way to center an empty/short state.
- Give list items stable `ValueKey`s; set `itemExtent` for fixed-height rows to smooth scrolling.
- Avoid deeply nested scrollables for performance.

Next up: **Dart Streams** — reactive data flow with `Stream` (a companion to `Future`).
