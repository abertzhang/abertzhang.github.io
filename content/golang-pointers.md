---
title:"Golang Pointers and Memory"
create:2026-10-04
update:2026-10-04
category:Golang
tags:[golang,pointer,memory]
summary:"Understand Go pointers — the address-of and dereference operators, pointers to structs, the difference between pass-by-value and pass-by-reference, nil pointers, new, and avoiding pointer pitfalls."
top:1
copyright:true
---

# Golang Pointers and Memory

Go is a **statically typed, compiled** language, but it supports **pointers** — variables that
hold a memory address instead of a value. Pointers let you reference data indirectly, which is
useful for large structs, optional/nil values, and letting functions modify their caller's data.

---

## Taking and Using Pointers

```go
x := 42
p := &x   // p holds the ADDRESS of x
fmt.Println(p)  // prints an address like 0xc0000140a0
fmt.Println(*p) // 42 — dereference to get the value

*p = 100        // modify x through the pointer
fmt.Println(x)  // 100
```

- **`&x`** — address-of operator.
- **`*p`** — dereference operator (read/write the value at the address).

---

## Value vs Pointer Semantics

This is the key concept. **Go passes everything by value**, but a pointer value is a copy *of the
address*, so both sides can reach the same underlying data.

### Pass by value (default) — the function gets a copy

```go
func increment(x int) {
    x++      // modifies the copy only
}

num := 5
increment(num)
fmt.Println(num) // 5 — unchanged
```

### Pass a pointer — the function can modify the original

```go
func increment(x *int) {
    *x++      // modify the value at the address
}

num := 5
increment(&num)
fmt.Println(num) // 6 — original changed
```

Use pointers when you need a function to **mutate** the caller's data, or to avoid copying a
large struct.

---

## Pointers to Structs

The most common real use. Methods can be defined on either a value or a pointer receiver; a
pointer receiver can modify the struct.

```go
type User struct {
    Name string
    Age  int
}

// Pointer receiver — can modify the original
func (u *User) Birthday() {
    u.Age++
}

func main() {
    u := User{Name: "Ada", Age: 36}
    u.Birthday()         // Go auto-takes the address (&u)
    fmt.Println(u.Age)   // 37
}
```

> Go automatically takes the address when you call a pointer-receiver method on an addressable
> value, so `u.Birthday()` works even though `u` is not a pointer.

### Pointer to struct in a container

```go
users := []*User{ // slice of pointers
    {Name: "Ada", Age: 36},
    {Name: "Alan", Age: 41},
}
users[0].Birthday() // modifies the actual struct in the slice
```

Using `[]User` (values) copies each element; using `[]*User` (pointers) shares them — a
meaningful distinction.

---

## nil Pointers

A zero-value pointer is `nil`. Dereferencing it causes a panic.

```go
var p *int
fmt.Println(p == nil) // true
// fmt.Println(*p)    // panic: nil pointer dereference
```

### Nil pointer checks (with a typed nil gotcha)

```go
func describe(i *int) {
    if i == nil {
        fmt.Println("nil pointer")
        return
    }
    fmt.Println(*i)
}
```

**Gotcha:** a function returning a *typed* nil (e.g. a `*MyError` that is nil) compared against
a plain `error` interface is **not** `== nil`, because the interface holds a type + value. This
is a classic Go bug — return the concrete nil carefully (a bare `return nil` works; don't store
a nil `*MyError` into an `error` variable first).

---

## new

`new(T)` allocates a zero-valued `*T` and returns the pointer:

```go
p := new(int)  // *int pointing at 0
*p = 10
fmt.Println(*p) // 10
```

In practice you rarely need `new` — `&Struct{}` and `&value` are more common and clearer.

---

## Escape Analysis and Performance

- Passing a large struct **by value** copies it — pass a pointer to avoid the copy.
- **Escape analysis**: if a pointer to a local variable outlives the function (e.g. returned),
  Go moves it to the heap. That means `&local` is safe — Go manages it for you.
- Pointers avoid copy costs, but overuse can hurt GC pressure. Pass large structs by pointer,
  small ones by value.

---

## Pointers vs Maps and Slices (a note)

Maps and slices are already **reference types** internally — you don't need a pointer to them
to share them. `map[string]int`, `[]int`, and `chan int` are shared by default when copied.

```go
m := map[string]int{"a": 1}
modifyMap(m)            // changes are visible to the caller
// slices: append may or may not share underlying array; use a pointer if you must
// guarantee a length change is visible
```

Use pointers mainly for **structs** you want to mutate explicitly.

---

## Key Takeaways

- `&x` takes an address, `*p` dereferences it; `*p = v` writes through the pointer.
- Go passes **by value**; passing `*T` lets a function modify the caller's data.
- **Pointer receivers** (`func (u *User) ...`) can mutate the struct; Go auto-addresses values.
- `[]*Struct` shares elements; `[]Struct` copies them — choose deliberately.
- Guard against `nil` pointers; watch the typed-nil-in-interface pitfall.
- `new(T)` gives a zero `*T`; prefer `&T{}` for clarity. Escape analysis moves escaping locals to the heap automatically.

Next up: **encoding/json** — working with JSON in Go.
