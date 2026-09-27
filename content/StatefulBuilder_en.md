---
title:StatefulBuilder
dcreate:2026-09-27
update:2026-09-27
category:Flutter
tags:[state,builder]
summary:A small-scope rebuild widget in Flutter — refresh local state without a full StatefulWidget
top:1
copyright:true
---
### StatefulBuilder Class

```
StatefulBuilder({
Key key, 
@required StatefulWidgetBuilder builder
})
```

### Primary Use Cases

- Rebuilding a small, local scope without wrapping everything in a `StatefulWidget`
- Rebuilding state inside a dialog

### Typedef  StatefulWidgetBuilder

```
typedef StatefulWidgetBuilder 
= Widget Function(BuildContext context, StateSetter setState);
```

### Simple Example 01

```
import 'package:flutter/material.dart';
void main() => runApp(MaterialApp(home: DemoCustomDialog()));
class DemoCustomDialog extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(title: Text("State inside dialog")),
      body: RaisedButton(
          onPressed: () =>
              showDialog(
                  context: context,
                  builder: (context) {
                    String label = 'test';
                    return Material(
                      child: StatefulBuilder(
                        builder: (context, state) {
                          return GestureDetector(
                            child: Text(label),
                            onTap: () {
                              label += 'test8';
// Note: do NOT call the parent page's setState; call the setState
// provided by the builder instead. To avoid confusion, the builder's
// setState is named `state` when constructing the builder.
                              state((){});
                            },
                          );
                        },
                      ),
                    );
                  }),
          child: Text("Tap me")));
}
```
