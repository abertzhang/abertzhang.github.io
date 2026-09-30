---
title:Golang Maps
create:2026-09-30
update:2026-09-30
category:Golang
tags:[golang,map]
summary: "Unordered key-value collections: creation, nil-map pitfalls, read/write, comma-ok, delete, len, range, pass-by-reference and common caveats."
top:1
copyright:true
---

# Go Study Notes: Maps

> Adapted from the Juejin article *"Go Language Chapter 7 (Map)"* ([original](https://juejin.cn/post/7671196739655712787)) by 小满zs.
> A map is an **unordered** collection of key-value pairs, ideal for looking up a *value* quickly by its *key*.

In everyday code, maps are used for configuration, counting occurrences, caching results, and more.

A map is a **reference type** whose zero value is `nil`. **Keys must be comparable types** (such as `string`, `int`, arrays); keys cannot be slices, maps, or functions. Values may be of any type.

---

## 1. Syntax

```go
var m map[KeyType]ValueType
m := map[KeyType]ValueType{key: value, ...}
m := make(map[KeyType]ValueType)
```

---

## 2. Definition and Initialization

There are three common ways: a literal, `make`, and declare-then-assign.

```go
package main

import "fmt"

func main() {
	// 1. Literal initialization (recommended — the contents are visible at a glance)
	scores := map[string]int{
		"math":    90,
		"english": 85,
		"physics": 92,
	}

	// 2. Create an empty map with make, then populate it
	person := make(map[string]string)
	person["name"] = "John"
	person["city"] = "Hangzhou"

	// 3. Declare first (it is nil at this point), then assign an existing map
	var ages map[string]int
	ages = map[string]int{"John": 18, "Jane": 20}

	fmt.Println(scores)
	fmt.Println(person)
	fmt.Println(ages)
}
```

### 2.1 Beware of nil maps

Writing only `var m map[string]int` without initialization leaves `m` as `nil`. **Writing to a nil map panics**, while reading is fine (you get the zero value). Whenever you need to write, initialize first with `make` or a literal.

```go
package main

func main() {
	var m map[string]int
	// m["a"] = 1  // panic: assignment to entry in nil map
	_ = m["a"]     // reading is fine, yields 0
}
```

### 2.2 Capacity hint for `make`

You can pass a second argument to `make` as an estimated capacity, which reduces reallocations (it is **not** a length limit):

```go
m := make(map[string]int, 10)
```

---

## 3. Reading and Writing Elements

Read and write with `map[key]`, much like indexing into a slice:

```go
package main

import "fmt"

func main() {
	scores := map[string]int{
		"math":    90,
		"english": 85,
	}

	fmt.Println(scores["math"]) // 90

	scores["english"] = 95  // update
	scores["physics"] = 88  // insert
	fmt.Println(scores)     // map[english:95 math:90 physics:88]
}
```

When the key does not exist, you get the **zero value of the value type** — no error:

```go
package main

import "fmt"

func main() {
	scores := map[string]int{"math": 90}
	fmt.Println(scores["history"]) // 0 (zero value of int)
}
```

So the value alone cannot distinguish "key absent" from "value happens to be the zero value". That is what the "comma ok" form is for.

---

## 4. Checking Whether a Key Exists

`value, ok := m[key]`: `ok` is `true` when the key exists.

```go
package main

import "fmt"

func main() {
	scores := map[string]int{
		"math":     90,
		"gym":      0, // the value really is 0
	}

	if score, ok := scores["math"]; ok {
		fmt.Println("math score:", score) // math score: 90
	}

	if score, ok := scores["gym"]; ok {
		fmt.Println("gym score:", score) // gym score: 0 (key exists, value is 0)
	} else {
		fmt.Println("no such subject: gym")
	}

	if _, ok := scores["music"]; !ok {
		fmt.Println("no such subject: music")
	}
}
```

When you only care about existence and not the value, discard the first result with `_`: `_, ok := scores["music"]`.

---

## 5. Deleting Elements

Use the built-in `delete`. It is safe to call even when the key does not exist:

```go
package main

import "fmt"

func main() {
	scores := map[string]int{
		"math":    90,
		"english": 85,
		"physics": 92,
	}

	delete(scores, "english")
	fmt.Println(scores) // map[math:90 physics:92]

	delete(scores, "gym") // key absent — nothing happens
	fmt.Println(scores)
}
```

`delete` returns nothing and does not report whether it succeeded. To confirm, check again with comma-ok after deleting.

---

## 6. Getting the Length

Use `len` to get the number of key-value pairs:

```go
package main

import "fmt"

func main() {
	scores := map[string]int{
		"math":    90,
		"english": 85,
	}
	fmt.Println(len(scores)) // 2

	delete(scores, "english")
	fmt.Println(len(scores)) // 1
}
```

> A map has **no concept of capacity** — unlike a slice, there is no `cap`.

---

## 7. Iterating a Map

Iterate with `range`. Each iteration yields the **key** and the **value**:

```go
package main

import "fmt"

func main() {
	person := map[string]string{
		"name": "John",
		"city": "Hangzhou",
		"job":  "programmer",
	}

	for key, value := range person {
		fmt.Println(key, value)
	}
}
```

Keys only, or values only:

```go
for key := range person {
	fmt.Println(key)
}

for _, value := range person {
	fmt.Println(value)
}
```

> **Note**: map iteration order is **not fixed** — the printed order can differ from run to run. If you need a stable order, collect the keys into a slice, sort them, and iterate.

---

## 8. Maps as Function Arguments

A map is a reference type, so additions, updates, and deletions made inside a function are visible outside:

```go
package main

import "fmt"

func bump(scores map[string]int, subject string, delta int) {
	scores[subject] += delta
}

func main() {
	scores := map[string]int{"math": 90}
	bump(scores, "math", 5)
	fmt.Println(scores["math"]) // 95
}
```

However, if inside the function you point the parameter at a different map (`scores = make(...)`), the outer variable **does not** change — you are reassigning the local variable, not the underlying data.

---

## 9. Common Pitfalls

| Point | Explanation |
|-------|-------------|
| Zero value | `nil`; writing panics, reading yields the value type's zero value |
| Key type | Must be comparable — no slice / map / function |
| Unordered | `range` order is not fixed |
| Missing key | Reads yield the zero value; distinguish with `value, ok := m[k]` |
| Concurrency | **Not** concurrency-safe by default; concurrent writes from multiple goroutines break |

---

## 10. Exercises

1. **Declaration and read/write**: create a `map[string]string` holding your name, city, and hobby; change the city, add a "job" key, and print the whole map.
2. **Comma ok**: given `scores := map[string]int{"math": 90, "english": 0}`, check whether "math", "english", and "physics" exist, and print the score or "not found" accordingly.
3. **Delete and length**: on the map from the previous exercise, delete "english" and print the remaining pair count with `len`.
4. **Count with iteration**: use a `map[string]int` to count occurrences of each fruit in the slice `[]string{"apple", "banana", "apple", "orange", "banana", "apple"}`, then iterate and print the result.
5. **Combined**: write a function `addScore(scores map[string]int, name string, score int)` that accumulates a person's score (creating the entry if absent). After calling it several times in `main`, print the name and score with the highest total.

---

## 11. Key Takeaways

- **A map is an unordered key-value collection**, a reference type with zero value `nil`.
- **Three ways to create**: literal / `make` / declare then assign an existing map.
- **A nil map can be read but not written** (writing panics); call `make` first to write.
- **Keys must be comparable**: `string`, `int`, arrays yes; slices, maps, functions no.
- **Reading a missing key** gives the zero value → distinguish with `value, ok := m[k]`.
- **Delete** with `delete(m, k)`; no return value, and safe when the key is absent.
- **Length** with `len`; there is **no `cap`**.
- **Iterate** with `range` — order is not fixed; sort keys first for a stable order.
- **Passing a map is by reference**: mutations are visible outside; but reassigning `m = make(...)` inside does not affect the caller.
- **Not concurrency-safe** — guard with a lock when multiple goroutines write.

---

*Reference: [Go Language Chapter 7 (Map)](https://juejin.cn/post/7671196739655712787) · Author: 小满zs*
