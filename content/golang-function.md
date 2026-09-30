---
title:Golang Functions
create:2026-09-30
update:2026-09-30
category:Golang
tags:[golang,function]
summary:Function definition and multiple returns, error handling (no try/catch), anonymous functions and closures, generics, defer/LIFO, polymorphism via interfaces.
top:1
copyright:true
---

# Go Study Notes: Functions

> Adapted from the Juejin article *"Go Language Chapter 8 (Functions)"* ([original](https://juejin.cn/post/7672244196402954303)) by 小满zs.
> A function is a reusable block of code: it takes parameters, executes logic, and hands the result back to the caller via `return`. Go's entry point is a function too — the program starts running at `main`.

---

## 1. Defining a Function

Basic syntax:

```go
func name(paramName paramType) returnType {
	// body
	return value
}
```

Broken down:

| Part | Meaning |
|------|---------|
| `func` | The keyword that declares a function |
| name | Callable within the package; a capital first letter exports it |
| parameter list | `name type`, comma-separated; same types can be merged as `a, b int` |
| return type | Placed after the parameter list; omit it if there is no return value |
| `return` | Ends the function and returns the result; the type must match the declaration |

Minimal example:

```go
package main

import "fmt"

func add(a int, b int) int {
	return a + b
}

func main() {
	fmt.Println(add(1, 2)) // 3
}
```

Parameters of the same type can be merged: `func add(a, b int) int`.

### 1.1 Multiple return values

Go supports returning several values at once, commonly seen as "result + error" (see *Error Handling* below):

```go
package main

import "fmt"

func calc(a, b int) (int, int) {
	return a + b, a - b
}

func main() {
	sum, sub := calc(1, 2)
	fmt.Println(sum, sub) // 3 -1
}
```

Return values can also be **named**. A bare `return` then returns the current values of those named variables:

```go
func calc(a, b int) (sum int, sub int) {
	sum = a + b
	sub = a - b
	return // equivalent to return sum, sub
}
```

Discard a value you don't need with `_`:

```go
sum, _ := calc(1, 2)
```

### 1.2 Caveats

1. **You cannot declare a named function inside a function.** This applies not only to `main` — no function may contain another `func foo() {}` declaration. Use an **anonymous function** instead (see below).
2. Functions do *not* need to be defined before use: **functions in the same package can be defined in any order**.
3. Go is **pass-by-value**: the callee receives a copy. To modify the caller's variable, pass a pointer, or use a reference-semantics type such as a slice or map.
4. Variadic parameters use `...Type`, e.g. `func sum(nums ...int) int`, called as `sum(1, 2, 3)`.

Wrong (does not compile):

```go
func main() {
	// Not allowed: declaring a named function inside a function
	func add(a, b int) int {
		return a + b
	}
}
```

Correct: write the inner logic as an anonymous function assigned to a variable:

```go
func main() {
	add := func(a, b int) int {
		return a + b
	}
	fmt.Println(add(1, 2))
}
```

---

## 2. Error Handling

Go has **no** `try / catch`. By convention, when a function can fail it returns an extra value: **`error` as the last return value**. The caller must check it.

`error` is a built-in interface with a single method, `Error() string`. Return `nil` when there is no error, and a non-`nil` error otherwise.

```go
package main

import (
	"errors"
	"fmt"
)

// divide returns an error when the divisor is 0
func divide(a, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("divisor must not be 0")
	}
	return a / b, nil
}

func main() {
	result, err := divide(10, 2)
	if err != nil {
		fmt.Println("error:", err)
		return
	}
	fmt.Println("result:", result) // 5

	_, err = divide(10, 0)
	if err != nil {
		fmt.Println("error:", err) // error: divisor must not be 0
	}
}
```

Common idioms:

| Idiom | Purpose |
|-------|---------|
| `errors.New("message")` | Create a simple error |
| `fmt.Errorf("a=%d invalid", a)` | Create a formatted error |
| `if err != nil { ... }` | The standard way to check an error |
| `return 0, err` | Propagate the error up to the caller |

> **Notes**
> 1. **Don't ignore `error`.** Writing `result, _ := divide(...)` swallows the error, which makes bugs very hard to track down.
> 2. On error, the first return value is typically the zero value (`0`, `""`, `nil`); the thing that matters is `err`.
> 3. Many standard-library functions follow this pattern, e.g. `os.Open` and `strconv.Atoi`:

```go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	n, err := strconv.Atoi("123")
	if err != nil {
		fmt.Println("conversion failed:", err)
		return
	}
	fmt.Println(n) // 123

	_, err = strconv.Atoi("abc")
	if err != nil {
		fmt.Println("conversion failed:", err)
	}
}
```

**Difference from `panic`** (just build intuition for now): use `error` for everyday, expected failures (file missing, invalid input); reserve `panic` for serious problems the program cannot recover from. At the beginning, focus on mastering `if err != nil`.

---

## 3. Anonymous Functions

A function without a name is an anonymous function. It can be executed immediately, assigned to a variable, or passed as an argument.

### 3.1 Execute immediately (IIFE)

```go
package main

import "fmt"

func main() {
	func() {
		fmt.Println("anonymous function")
	}() // the trailing () invokes it immediately
}
```

### 3.2 Assign to a variable, then call

```go
package main

import "fmt"

func main() {
	greet := func(name string) {
		fmt.Println("Hello,", name)
	}
	greet("Go")
}
```

### 3.3 Caveats

1. **Closures capture the outer variable itself.** When an anonymous function references an outer variable, it gets the variable (reference semantics), not a snapshot copy. This bites especially often when starting goroutines inside loops — watch out.
2. Anonymous functions can access variables in the enclosing scope, making them a good fit for callbacks and deferred logic (together with `defer`).
3. Only values of a *function type* can be assigned and passed; a named function itself is not a variable, but you can write `f := add` to use it as a value.
4. For logic that is reused often or exported to other packages, prefer a package-level named function — better readability and easier debugging.

### 3.4 Closure example

```go
package main

import "fmt"

func makeCounter() func() int {
	n := 0
	return func() int {
		n++
		return n
	}
}

func main() {
	next := makeCounter()
	fmt.Println(next()) // 1
	fmt.Println(next()) // 2
}
```

---

## 4. Generic Functions

Without generics, writing the same addition for `int` and `float64` means two nearly identical functions — tedious:

```go
func addInt(a, b int) int { return a + b }
func addFloat(a, b float64) float64 { return a + b }
```

Since Go 1.18, **type parameters** are supported. Parameterizing the *type* lets one function serve many types — that is the central idea of generics:

```go
package main

import "fmt"

// T is constrained to int, uint, or float64 — all support +
func add[T int | uint | float64](a, b T) T {
	return a + b
}

func main() {
	fmt.Println(add[int](1, 2))       // explicitly specify the type argument
	fmt.Println(add[uint](1, 2))
	fmt.Println(add(1.5, 2.5))        // the compiler infers T as float64
}
```

- `[T int | uint | float64]`: the type parameter `T` and the set of types it allows (the **type constraint**).
- You can write `add[int](1, 2)`, and in most cases the type is **inferred** from the arguments, so it can be omitted.
- All types in the constraint must support the operations used in the body, or compilation fails.

More advanced forms use `comparable` or custom interface constraints. For now just remember: **generics eliminate duplicated functions that share logic but differ in type.**

---

## 5. The `defer` Keyword

`defer` postpones a function call until **just before the current function returns**. It is commonly used for cleanup that comes in pairs: closing files, unlocking, printing a final message, etc.

### 5.1 Basic example

```go
package main

import "fmt"

func main() {
	fmt.Println("main 1")
	defer fmt.Println("defer 1")
	fmt.Println("main 2")
}
```

Output:

```text
main 1
main 2
defer 1
```

### 5.2 Multiple defers: LIFO (last in, first out)

Multiple `defer`s run in stack order — **the last registered runs first**:

```go
package main

import "fmt"

func main() {
	defer fmt.Println("first")
	defer fmt.Println("second")
	defer fmt.Println("third")
	fmt.Println("body")
}
```

Output:

```text
body
third
second
first
```

### 5.3 Practical use: guaranteed resource release

Call `defer Close()` right after opening a file; it will close whether the function returns normally or early:

```go
package main

import (
	"fmt"
	"os"
)

func readFile(path string) error {
	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close() // closes before the function returns, avoiding leaks

	buf := make([]byte, 64)
	n, err := f.Read(buf)
	if err != nil {
		return err
	}
	fmt.Println(string(buf[:n]))
	return nil
}
```

### 5.4 Two more points

1. **Arguments are evaluated when the `defer` statement executes**, not when the call actually happens:

```go
package main

import "fmt"

func main() {
	x := 1
	defer fmt.Println("defer:", x) // x=1 is already passed in here
	x = 2
	fmt.Println("main:", x)
}
```

The output is `main: 2`, then `defer: 1`.

2. `defer` binds a **function**, not a block of code. A `defer` inside a `for` loop only runs when the enclosing function returns; repeatedly deferring in a loop can pile up many calls, so usually wrap it in an inner function or restructure.

---

## 6. Simulating "Object-Oriented" Behavior with Interfaces

Let's be clear up front:

- Go has **no classes** and no class-based inheritance; it is **not** a traditional OOP language like Java or C++.
- What Go offers is: **structs hold data**, **methods attach behavior**, **interfaces describe capabilities**. Polymorphism is achieved mainly through interfaces.
- So the accurate statement is: Go uses "composition + methods + interfaces" to achieve effects similar to OOP polymorphism and behavior-oriented programming, rather than copying a class system.

An interface only declares "which methods must exist" — it doesn't care about the concrete type:

```go
package main

import "fmt"

// Speaker describes the ability "can speak"
type Speaker interface {
	Speak() string
}

type Dog struct {
	Name string
}

func (d Dog) Speak() string {
	return d.Name + ": woof"
}

type Cat struct {
	Name string
}

func (c Cat) Speak() string {
	return c.Name + ": meow"
}

// depends only on the interface, not on concrete types
func say(s Speaker) {
	fmt.Println(s.Speak())
}

func main() {
	say(Dog{Name: "Rex"})
	say(Cat{Name: "Kitty"})
}
```

**Key points:**

1. A type does **not** need to write `implements` explicitly. As long as its method set satisfies the interface, it implements the interface automatically.
2. Once a parameter is typed as an interface, any value implementing those methods can be passed in — that is the polymorphism interfaces provide.
3. To reuse fields/methods, prefer struct **embedding (composition)** over inheritance.

> Common misconception: seeing methods and interfaces and assuming Go is class-based OOP. In fact it deliberately avoids inheritance trees, putting the emphasis on interfaces and composition.

---

## 7. Exercises

1. **Basic function**: write `max(a, b int) int` returning the larger number; call it in `main` and print the result.
2. **Multiple return values**: write `swap(a, b int) (int, int)` that swaps two integers and returns them; verify with `x, y := swap(1, 2)`.
3. **Error handling**: write `sqrt(n float64) (float64, error)`: return an error when `n < 0` (use `errors.New`), otherwise return the square root (use `math.Sqrt`). Call it in `main` with both a positive and a negative number, handling `err` properly.
4. **Anonymous function**: in `main`, use an anonymous function to print 1 through 5, executing immediately; then assign the same logic to a variable and call it once more.
5. **Combined**: write `parseAndDouble(s string) (int, error)` that converts a string to an int with `strconv.Atoi` and doubles it; return the error if conversion fails. Test both `"21"` and `"abc"` in `main`.

---

## 8. Key Takeaways

- **Definition**: `func name(params) returnType { return ... }`; same-type params merge as `a, b int`; a capital first letter exports the function.
- **Multiple returns**: `(int, int)`; **named results** allow a bare `return`; discard unwanted values with `_`.
- **Restrictions**: **no named functions inside functions** (use anonymous ones); functions in a package can be defined in any order; **pass-by-value** (pass a pointer or use a reference-semantics type to mutate); variadic `...T`.
- **Error handling**: no try/catch; convention is a trailing `error` return with `nil` meaning no error; check with `if err != nil`; **never ignore errors**; use `error` for expected failures, `panic` only for fatal problems.
- **Anonymous functions**: can run immediately as `func(){...}()` or be assigned to a variable; **closures capture the outer variable itself** (reference semantics).
- **Generic functions**: Go 1.18+ supports `func f[T constraint](a, b T) T`; specify the type explicitly or let it be inferred; they remove duplication across types.
- **`defer`**: runs just before the function returns; multiple defers are **LIFO**; arguments are evaluated at the defer statement; the classic use is `defer f.Close()`.
- **Interface polymorphism**: Go has no classes/inheritance; "struct + methods + interface" delivers polymorphism; **implicit implementation** (no `implements` keyword); prefer embedding/composition for reuse.

---

*Reference: [Go Language Chapter 8 (Functions)](https://juejin.cn/post/7672244196402954303) · Author: 小满zs*
