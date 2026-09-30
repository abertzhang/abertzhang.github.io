---
title:Golang Quick Syntax Basics
create:2026-09-30
update:2026-09-30
category:Golang
tags:[golang,syntax,basics]
summary: "Go syntax quick reference generated from 01basic/02base/base.go: variables, constants, types, control flow, operators, conversions, strconv and fmt."
top:1
copyright:true
---

# Golang Quick Syntax Basics

> A concise, example-driven reference generated from [`01basic/02base/base.go`](../01basic/02base/base.go).
> Every snippet below mirrors a construct used in that source file.

## 1. Package & Entry Point

Every runnable Go program lives in `package main` and exposes a `main()` function, which is the program entry point.

```go
package main

import (
    "fmt"
    "strconv"
)

func main() {
    variableExamples()
    loopExamples()
    operatorExamples()
    convertExamples()
}
```

Other functions are just ordinary top-level declarations and must be called explicitly.

---

## 2. Variables

### 2.1 Explicit type + initializer

```go
var name string = "Alice"
var a int = 10
var b float64 = 20.5
```

### 2.2 Type inference

When you supply an initializer, the type can be omitted and Go infers it:

```go
var age = 30          // inferred as int
gender := "Female"   // short declaration, inferred as string
from, career := "USA", "Engineer"  // multiple short declarations
```

> **Note:** `:=` is the *short declaration* operator. It requires **at least one new variable** on the left side. Re-declaring an already-declared variable with `:=` in the same scope is a compile error:
>
> ```go
> c := "hello"        // c is a string here
> // ... later in the same scope:
> c, err := strconv.ParseComplex(s, 128)  // ❌ no new variables on left side of :=
> ```
>
> Fix by using a fresh name:
>
> ```go
> comp, err := strconv.ParseComplex(s, 128) // ✅ comp is new, err is reused
> ```

### 2.3 Multiple assignment

```go
from, career := "USA", "Engineer"
x, y, z int = 1, 2, 3
```

---

## 3. Constants

Constants are declared with `const`. A `const` block groups related constants.

```go
const pi = 3.14

const (
    e = 2.71
    g = 9.81
)
```

---

## 4. Built-in Types

| Category | Types |
|----------|-------|
| Integers | `int8 int16 int32 int64 int`, `uint8 uint16 uint32 uint64 uint uintptr` |
| Floats   | `float32 float64` |
| Complex  | `complex64 complex128` |
| Boolean  | `bool` |
| String   | `string` |

```go
var a int = 10
var b float64 = 20.5
c := 30
```

---

## 5. Composite Types

### 5.1 Array (fixed length)

```go
var arr [3]int = [3]int{1, 2, 3}
```

### 5.2 Slice (dynamic)

```go
var slice []int = []int{4, 5, 6}
var emptySlice []int = []int{}
```

### 5.3 Map

```go
var m map[string]int = map[string]int{"one": 1, "two": 2}
var emptyMap map[string]int = map[string]int{}
```

### 5.4 Struct

```go
type Person struct {
    Name string
    Age  int
}
var p Person = Person{Name: "Bob", Age: 25}
```

### 5.5 Pointer

```go
var ptr *int = &a
fmt.Println(*ptr)   // dereference
```

### 5.6 Interface

```go
var i interface{} = "Hello"
```

### 5.7 Function as a value

```go
var f func(int, int) int = func(x, y int) int {
    return x + y
}
fmt.Println(f(2, 3))
```

### 5.8 Channel

```go
ch := make(chan int)
go func() {
    ch <- 42
}()
fmt.Println(<-ch)
```

---

## 6. Zero Values & `nil`

Variables declared without an explicit initializer take their **zero value**:

| Type | Zero value |
|------|-----------|
| int | `0` |
| float | `0.0` |
| bool | `false` |
| string | `""` |
| pointer / slice / map / chan / func / interface | `nil` |

```go
var zeroInt int
var zeroFloat float64
var zeroBool bool
var zeroString string

var n *int = nil   // nil pointer
```

---

## 7. Control Flow

### 7.1 `if` / `else if` / `else`

```go
score := 85
if score >= 80 {
    fmt.Println("Grade: A")
} else if score >= 60 {
    fmt.Println("Grade: B")
} else {
    fmt.Println("Grade: C")
}
```

### 7.2 `switch` with `fallthrough`

```go
day := "Monday"
switch day {
case "Monday":
    fmt.Println("Start of the work week")
    fallthrough   // continues into the next case
case "Friday":
    fmt.Println("End of the work week")
default:
    fmt.Println("Midweek")
}
```

### 7.3 `for` loops

Go has only one loop keyword, `for`, used in several forms.

**Classic three-part loop**

```go
for i := 0; i < 5; i++ {
    fmt.Println(i)
}
```

**While-style (condition only)**

```go
j := 0
for j < 5 {
    fmt.Println(j)
    j++
}
```

**`for range`** — iterate over arrays, slices, maps, and strings:

```go
arr := []int{1, 2, 3, 4, 5}
for index, value := range arr {
    fmt.Println(index, value)
}

person := map[string]string{"name": "Alice", "city": "New York"}
for key, value := range person {
    fmt.Println(key, value)
}

text := "Hello Go"
for index, char := range text {   // range over a string yields runes
    fmt.Printf("index %d, char %c\n", index, char)
}
```

**Nested loops**

```go
for i := 1; i <= 3; i++ {
    for j := 1; j <= 3; j++ {
        fmt.Printf("i: %d, j: %d\n", i, j)
    }
}
```

### 7.4 `break` / `continue` / labeled `break` / `goto`

```go
for i := 0; i < 10; i++ {
    if i == 5 {
        break
    }
    if i%2 == 0 {
        continue
    }
    fmt.Println(i)
}

// Labeled break escapes the outer loop
Outer:
    for i := 0; i < 3; i++ {
        for j := 0; j < 3; j++ {
            if i == 1 && j == 1 {
                break Outer
            }
            fmt.Println(i, j)
        }
    }

// goto jumps to a label in the same scope
i := 0
here:
    fmt.Println(i)
    i++
    if i < 5 {
        goto here
    }
```

### 7.5 `defer`

A `defer` call runs after the surrounding function returns (LIFO order).

```go
defer fmt.Println("This will be printed last")
fmt.Println("This will be printed first")
```

---

## 8. Operators

### 8.1 Arithmetic & comparison

```go
a := 10
b := 3
fmt.Println(a + b)  // 13
fmt.Println(a - b)  // 7
fmt.Println(a * b)  // 30
fmt.Println(a / b)  // 3
fmt.Println(a % b)  // 1
fmt.Println(a == b) // false
fmt.Println(a > b)  // true
```

### 8.2 Bitwise

```go
fmt.Println(a & b)   // 2   AND
fmt.Println(a | b)   // 11  OR
fmt.Println(a ^ b)   // 9   XOR
fmt.Println(a &^ b)  // 8   AND NOT
fmt.Println(a << 1)  // 20  left shift
fmt.Println(a >> 1)  // 5   right shift
```

### 8.3 Logical

```go
flag, isInit := true, false
fmt.Println(flag && isInit) // false
fmt.Println(flag || isInit) // true
fmt.Println(!flag)          // false
```

### 8.4 Assignment & compound assignment

```go
c := a + b
c += 2   // 15
c -= 3   // 12
c *= 2   // 24
c /= 4   // 6
c %= 5   // 1
c <<= 1  // 2
c >>= 1  // 1
c &= 3   // 1
c |= 2   // 3
c ^= 1   // 2
c &^= 1  // 2
```

---

## 9. Type Conversions

Go does **not** perform implicit numeric conversion; use explicit conversion functions/casts.

```go
a := 123
b := 45.67
c := "hello"
d := []byte("world")

fmt.Println(int32(a))     // int -> int32
fmt.Println(float64(b))   // float -> float64
fmt.Println(c)            // string
fmt.Println(d)            // []byte

// string <-> []byte
s5 := "hello"
b2 := []byte(s5)
b3 := []byte{119, 111, 114, 108, 100}
s6 := string(b3)

// string <-> rune
s7 := "hello"
r := []rune(s7)
s8 := string(r)

// interface{} <-> concrete type
s9 := "hello"
var in interface{} = s9
s10, ok := in.(string)   // type assertion
if ok {
    fmt.Println(s10)
}
```

### Boolean ↔ numeric (manual)

```go
// bool -> int
b6 := true
i3 := 0
if b6 {
    i3 = 1
}
// int -> bool
i4 := 1
b7 := i4 != 0
// float -> bool
f5 := 0.0
b8 := f5 != 0
// bool -> float
b9 := true
f6 := 0.0
if b9 {
    f6 = 1.0
}
```

---

## 10. `strconv` — String Conversions

The `strconv` package parses and formats primitives.

```go
// string -> int
s := "123"
i, err := strconv.Atoi(s)
if err != nil {
    fmt.Println(err)
} else {
    fmt.Println(i) // 123
}

// int -> string
i2 := 456
s2 := strconv.Itoa(i2)

// string -> float64
s3 := "45.67"
f, err := strconv.ParseFloat(s3, 64)
if err == nil {
    fmt.Println(f) // 45.67
}

// float64 -> string
f2 := 78.9
s4 := strconv.FormatFloat(f2, 'f', 2, 64) // "78.90"

// string -> bool
s11 := "true"
b4, err := strconv.ParseBool(s11)

// bool -> string
b5 := true
s12 := strconv.FormatBool(b5)

// string -> complex128
s13 := "1+2i"
comp, err := strconv.ParseComplex(s13, 128)
if err == nil {
    fmt.Println(comp) // (1+2i)
}
```

Summary table:

| Conversion | Function |
|-----------|----------|
| string → int | `strconv.Atoi` |
| int → string | `strconv.Itoa` |
| string → float | `strconv.ParseFloat` |
| float → string | `strconv.FormatFloat` |
| string → bool | `strconv.ParseBool` |
| bool → string | `strconv.FormatBool` |
| string → complex | `strconv.ParseComplex` (`bitSize` 64 or 128) |

---

## 11. Formatting with `fmt`

```go
// Print a struct / value
fmt.Println(p)

// Format into a string without printing
c2 := complex(3, 4)
s14 := fmt.Sprintf("%v", c2) // "3+4i"
fmt.Println(s14)
```

`fmt.Println` prints its arguments separated by spaces and followed by a newline. `fmt.Sprintf` is the same formatting, but returns the string instead of printing.

---

## 12. Quick Reference Cheat Sheet

- `var x T = v` — explicit variable declaration.
- `x := v` — short declaration (type inferred; needs a new variable on the left).
- `const` — immutable compile-time constants.
- `for` — the only loop keyword; supports 3-part, condition-only, and `range` forms.
- `if` / `switch` / `defer` / `goto` / labeled `break` — control flow.
- `make(chan T)` — create a channel; `<-ch` receive, `ch <- v` send.
- `&x` / `*p` — address-of and dereference.
- `T(v)` — explicit conversion (no implicit numeric casts in Go).
- `strconv.*` — parse/format primitives to/from strings.
- `interface{}` + type assertion `v, ok := x.(T)` — work with any type.

---

*Generated from `01basic/02base/base.go`. All examples are taken directly from the source file so they compile and run as shown.*
