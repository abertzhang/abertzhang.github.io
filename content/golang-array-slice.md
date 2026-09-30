---
title:Golang Arrays and Slices
create:2026-09-30
update:2026-09-30
category:Golang
tags:[golang,array,slice]
summary: "Fixed-length arrays vs. variable-length slices: declaration, len/cap, slicing, append, prepend and middle insert, plus a comparison and exercises."
top:1
copyright:true
---

# Go Study Notes: Arrays and Slices

> Adapted from the Juejin article *"Go Language Chapter 5 (Arrays and Slices)"* ([original](https://juejin.cn/post/7669788995465658378)) by 小满zs.
> Arrays and slices both store **a group of values of the same type** and have very similar syntax, so they are covered together.

Remember one key difference up front: **an array has a fixed length, a slice has a variable length.**

---

## 1. Arrays

An array's length is fixed at declaration time and cannot change afterwards. Element types are free, but every element in one array must be the same type.

### 1.1 Declaration syntax

```go
var arr = [length]Type{value1, value2, value3, ...}
arr := [length]Type{value1, value2, value3, ...}
```

Example:

```go
package main

import "fmt"

func main() {
	var arr = [5]int{1, 2, 3, 4, 5}
	arr2 := [5]int{6, 7, 8, 9, 10}
	fmt.Println(arr, arr2)
}
```

Both forms work: the full `var` declaration, or the short `:=` declaration.

`[5]int` means "length 5, element type `int`" — **the length is part of the type**, so `[5]int` and `[4]int` are two different types.

### 1.2 Reading and writing elements

Access and modify elements by index. Indexes start at `0`:

```go
package main

import "fmt"

func main() {
	arr := [4]string{"sing", "dance", "rap", "basketball"}
	// index:  0        1        2      3

	fmt.Println(arr[0]) // sing

	arr[0] = "basketball"
	fmt.Println(arr[0]) // basketball
}
```

### 1.3 Getting the length

Use the built-in `len` function to get an array's length:

```go
package main

import "fmt"

func main() {
	arr := [4]string{"sing", "dance", "rap", "basketball"}
	fmt.Println(len(arr)) // 4
}
```

---

## 2. Slices

A slice can be thought of as "an array of variable length". In everyday development it is used far more often than arrays.

### 2.1 Declaration syntax

Syntactically, just drop the length from an array declaration:

```go
var s = []Type{value1, value2, value3, ...}
s := []Type{value1, value2, value3, ...}
```

Example:

```go
package main

import "fmt"

func main() {
	var s1 = []int{1, 2, 3}
	s2 := []string{"sing", "dance", "rap"}
	fmt.Println(s1, s2)
}
```

`[]int` has no fixed length, so this is a **slice**, not an array.

### 2.2 Reading and writing elements

Reading and writing work the same way as arrays — by index:

```go
package main

import "fmt"

func main() {
	s := []string{"sing", "dance", "rap", "basketball"}

	fmt.Println(s[1]) // dance

	s[1] = "play ball"
	fmt.Println(s) // [sing play ball rap basketball]
}
```

### 2.3 Length and capacity

A slice has two commonly used properties:

- `len`: the current number of elements
- `cap`: the capacity of the underlying array (how much can be held before reallocation)

```go
package main

import "fmt"

func main() {
	s := []int{1, 2, 3}
	fmt.Println(len(s)) // 3
	fmt.Println(cap(s)) // 3
}
```

### 2.4 Slicing

Use `slice[low:high]` to "carve out" a segment from an existing slice (or array), producing a new slice. The range is **half-open**: it includes index `low` and excludes index `high`.

```go
package main

import "fmt"

func main() {
	s := []int{10, 20, 30, 40, 50}
	// index: 0   1   2   3   4

	fmt.Println(s[1:4]) // [20 30 40]  indexes 1, 2, 3
	fmt.Println(s[:3])  // [10 20 30]  from the start up to index 3 (exclusive)
	fmt.Println(s[2:])  // [30 40 50]  from index 2 to the end
	fmt.Println(s[:])   // [10 20 30 40 50]  the whole thing
}
```

Common forms:

| Form | Meaning |
|------|---------|
| `s[low:high]` | from `low` to `high` (excluding `high`) |
| `s[:high]` | from the start to `high` (excluding `high`) |
| `s[low:]` | from `low` to the end |
| `s[:]` | the entire slice |

You can do the same on an array, and the result is a slice:

```go
package main

import "fmt"

func main() {
	arr := [5]int{10, 20, 30, 40, 50}
	s := arr[1:4]
	fmt.Println(s) // [20 30 40]
}
```

> **Note:** A sliced result **shares the underlying array** with the original data — change one side and the other changes too. This is why `s[:idx]` and `s[idx:]` show up so often when prepending or inserting in the middle.

### 2.5 Appending elements

Since a slice has a variable length, adding elements is the most common operation. Go only provides a built-in `append` that adds to the **tail**; inserting at the front or in the middle must be assembled manually from `append` and slicing.

#### Append to the tail

`append` takes the original slice plus the elements to add, and returns a new slice. It grows automatically when capacity is exceeded:

```go
package main

import "fmt"

func main() {
	s := []int{1, 2, 3}
	s = append(s, 4, 5)
	fmt.Println(s) // [1 2 3 4 5]
}
```

You can append several values at once. **Remember to assign the result back** (`s = append(...)`), or the original slice won't see the new elements.

#### Prepend to the front

Go has no built-in "insert at the head" function. The idea is: build a slice holding the new elements, then append the original slice after it.

This is where the `...` (spread operator) comes in: `s...` expands the elements of slice `s` into individual arguments for `append`.

```go
package main

import "fmt"

func main() {
	s := []int{1, 2, 3, 4, 5}
	s = append([]int{-1, 0}, s...)
	// equivalent to: append([]int{-1, 0}, 1, 2, 3, 4, 5)
	fmt.Println(s) // [-1 0 1 2 3 4 5]
}
```

Two steps, unpacked:

1. `[]int{-1, 0}`: the new elements to place at the front
2. `s...`: expands the original `1, 2, 3, 4, 5` and attaches it after them

#### Insert in the middle

There is likewise no built-in method. In essence you split the slice into "first half + new elements + second half" and stitch it back together.

Suppose the slice is `[-1 0 1 2 3 4 5]` and you want to insert `100, 200` after `2` (at index `4`):

```go
package main

import "fmt"

func main() {
	s := []int{-1, 0, 1, 2, 3, 4, 5}
	// index:  0  1  2  3  4  5  6
	idx := 4 // insert starting at index 4, i.e. right after 2

	s = append(s[:idx], append([]int{100, 200}, s[idx:]...)...)
	fmt.Println(s) // [-1 0 1 2 100 200 3 4 5]
}
```

The line breaks into three parts:

| Part | Meaning | Result |
|------|---------|--------|
| `s[:idx]` | before the insertion point | `[-1 0 1 2]` |
| `[]int{100, 200}` | the elements to insert | `[100 200]` |
| `s[idx:]` | the insertion point and after | `[3 4 5]` |

First `append([]int{100, 200}, s[idx:]...)` yields `[100 200 3 4 5]`, which is then attached after `s[:idx]` to build the final result.

It looks convoluted, but just remember the formula: **first half + new elements + second half.**

---

## 3. Array vs. Slice

| Aspect | Array | Slice |
|--------|-------|-------|
| Length | Fixed, set at declaration | Variable, grows/shrinks via `append` |
| Type syntax | `[5]int` | `[]int` |
| Passing | Copied by value (the whole array) | References the underlying array (lighter) |
| Typical use | Length known and fixed | More common in everyday code |

For beginners, just remember: **if the length is uncertain or you need to add/remove elements, use a slice.**

---

## 4. Exercises

1. **Array basics**: declare an `int` array of length `5`, assign values `1`–`5`, print the 3rd element (mind the index), then print the array length with `len`.
2. **Slice declaration and append**: declare `[]string{"sing", "dance", "rap"}`, append `"basketball"` to the tail with `append`, and print the slice, its `len`, and its `cap`.
3. **Slicing**: given `s := []int{10, 20, 30, 40, 50}`, print `s[1:4]`, `s[:3]`, `s[2:]`, and `s[:]`, and check the results against the table above.
4. **Prepend and middle insert**: starting from `[]int{1, 2, 3, 4, 5}`, first insert `-1, 0` at the very front; then insert `100, 200` after the element `3`. Print the final slice.
5. **Combined exercise**: store course scores in a slice (e.g. `[]int{95, 58, 76, 42, 88}`). Iterate over it: set anything below `60` to `0` (meaning a retake), then slice out the first `3` scores and print them, and count how many subjects passed.

---

## 5. Key Takeaways

- **Arrays have a fixed length**; `[5]int` and `[4]int` are different types — length is part of the type.
- **Slices have a variable length**; declared as `[]T`, backed by a structure pointing to an array (pointer + `len` + `cap`).
- **Slicing is half-open**: `s[low:high]` includes `low` and excludes `high`, and shares the underlying array with the original.
- **`append` only adds to the tail**, and you must write `s = append(s, ...)` to capture the returned slice.
- **Front/middle insertion must be assembled by hand**: `append` + `...` spread.
- **Uncertain length, or need to add/remove → use a slice.**

---

*Reference: [Go Language Chapter 5 (Arrays and Slices)](https://juejin.cn/post/7669788995465658378) · Author: 小满zs*
