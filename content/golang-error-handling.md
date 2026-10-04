---
title:"Golang Error Handling"
create:2026-10-04
update:2026-10-04
category:Golang
tags:[golang,error,panic]
summary:"Go's error model — the error interface, creating errors with errors.New and fmt.Errorf, custom error types, checking with errors.Is and errors.As, wrapping, and when to use panic and recover."
top:1
copyright:true
---

# Golang Error Handling

Go treats errors as **ordinary values**, not exceptions. There are no `try/catch`; instead
functions return an `error` as their last return value, and you check it. This makes error
paths explicit and (mostly) impossible to ignore.

---

## The error Interface

```go
type error interface {
    Error() string
}
```

Any type with an `Error() string` method **is** an error. Functions signal failure by returning
a non-nil error as their last value:

```go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}
```

Always **check the error immediately** after the call:

```go
result, err := divide(10, 2)
if err != nil {
    return fmt.Errorf("divide: %w", err) // wrap with context
}
fmt.Println(result)
```

> The convention: the error is the **last** return value, and you handle it right away.

---

## Creating Errors

### errors.New (static message)

```go
import "errors"

var ErrNotFound = errors.New("not found") // package-level sentinel error
```

### fmt.Errorf (formatted, with %w for wrapping)

```go
import "fmt"

err := fmt.Errorf("could not open file %q: %w", path, os.ErrNotExist)
// %w wraps the underlying error so errors.Is/As can unwrap it
```

Without `%w`, `fmt.Errorf` creates a new error with no link to the cause — always use `%w`
when you want to preserve the chain.

---

## Checking Errors: errors.Is and errors.As

### errors.Is — compare against a known error

```go
if errors.Is(err, os.ErrNotExist) {
    // handle "file does not exist"
}

if errors.Is(err, ErrNotFound) {
    // handle our sentinel
}
```

### errors.As — extract a typed error

```go
var pathErr *os.PathError
if errors.As(err, &pathErr) {
    fmt.Println("Failed path:", pathErr.Path, "op:", pathErr.Op)
}
```

Use the older direct comparison `err == ErrNotFound` only for sentinels; `errors.Is` also walks
the wrap chain, so it's the safer habit.

---

## Custom Error Types

Define a struct implementing `error` when you need structured data in the error:

```go
package validation

import "fmt"

type FieldError struct {
    Field string
    Msg   string
}

func (e *FieldError) Error() string {
    return fmt.Sprintf("field %q: %s", e.Field, e.Msg)
}

func NewFieldError(field, msg string) error {
    return &FieldError{Field: field, Msg: msg}
}
```

```go
err := validation.NewFieldError("email", "invalid format")
var fe *validation.FieldError
if errors.As(err, &fe) {
    fmt.Println(fe.Field) // "email"
}
```

This lets callers inspect the **type** and its fields — far richer than a bare string.

---

## Wrapping Errors for Context

Add context as the error bubbles up, without losing the original cause:

```go
func LoadConfig(path string) ([]byte, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("LoadConfig: read %s: %w", path, err)
    }
    return data, nil
}
```

A top-level handler logs the full chain; any frame can check `errors.Is` for a specific cause.

---

## panic and recover (used sparingly)

`panic` aborts the current goroutine. `recover` (only useful inside a `defer`) can catch it.
Go convention: **return errors for expected failures; use `panic` only for programming bugs**
(impossible states, nil derefs you didn't handle) or at `main` during startup.

```go
func safeDiv(a, b float64) (result float64, err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recovered: %v", r)
        }
    }()
    return a / b, nil // b==0 would panic on some float ops
}
```

Most standard APIs (e.g. `json.Unmarshal` on bad input) **return** errors rather than panicking.

---

## Idioms and Best Practices

- **Define sentinel errors** (`var ErrX = errors.New(...)`) when callers need to branch on a specific cause.
- **Use `%w` to wrap** when you want callers to unwrap; add context as the error propagates.
- **Check errors immediately** — never `result, _ := f()` in real code (ignoring is a smell).
- **Return errors, don't log-and-continue** at low levels; let the caller decide.
- **Use `errors.As`** for typed errors, `errors.Is` for sentinels.
- Reserve `panic`/`recover` for true programming errors and library boundaries.

---

## Quick Reference

```go
// Sentinel
var ErrTimeout = errors.New("timeout")

// Create
err1 := errors.New("bad input")
err2 := fmt.Errorf("field %d: %w", i, ErrTimeout)

// Check
if errors.Is(err, ErrTimeout) { ... }

// Typed
var te *TypeError
if errors.As(err, &te) { ... }

// Wrap
return fmt.Errorf("context: %w", err)
```

---

## Key Takeaways

- Go errors are values implementing the single-method `error` interface — no exceptions.
- Return the error as the last value and check it right away; wrap with `%w` to add context.
- Use `errors.Is` for sentinel comparison and `errors.As` to extract typed errors.
- Create custom error structs when callers need structured fields.
- Reserve `panic`/`recover` for programming bugs and boundaries, not routine failures.

Next up: **Channels** — Go's primitive for goroutine communication and synchronization.
