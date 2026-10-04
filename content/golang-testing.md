---
title:"Golang Testing"
create:2026-10-04
update:2026-10-04
category:Golang
tags:[golang,testing,tdd]
summary:"Write tests with Go's built-in testing package — the testing.T API, the table-driven test pattern, subtests, benchmarks, test coverage, and running tests with go test."
top:1
copyright:true
---

# Golang Testing

Go ships a testing framework in the standard library — no third-party library needed for
unit tests. The `testing` package, paired with the `go test` command, is the norm for Go
development. Learn the table-driven pattern and you can test almost anything concisely.

---

## A Basic Test

Create a file ending in `_test.go` next to the code:

```go
// math.go
package math

func Add(a, b int) int { return a + b }
```

```go
// math_test.go
package math

import "testing"

func TestAdd(t *testing.T) {
    if got := Add(2, 3); got != 5 {
        t.Errorf("Add(2, 3) = %d; want 5", got)
    }
}
```

Run it:

```bash
go test          # run all tests in the current package
go test ./...    # run tests in all packages
go test -v       # verbose: show each test name
```

Key methods on `*testing.T`:
- `t.Errorf(format, args...)` — log a failure but **continue** the test.
- `t.Fatalf(format, args...)` — log a failure and **stop** immediately.
- `t.Log / t.Logf` — log extra info (shown with `-v`).
- `t.Skip(reason)` — skip the test.
- `t.Parallel()` — run this test in parallel with others.

---

## The Table-Driven Test Pattern

The idiomatic Go way to test many cases without repeating code. Put the inputs and expected
outputs in a slice of structs, then loop:

```go
func TestDivide(t *testing.T) {
    tests := []struct {
        name    string
        a, b    int
        want    float64
        wantErr bool
    }{
        {"positive", 10, 2, 5, false},
        {"zero dividend", 0, 5, 0, false},
        {"negative", -10, 2, -5, false},
        {"divide by zero", 1, 0, 0, true}, // expect an error
    }

    for _, tt := range tests {
        tt := tt // capture for parallel (optional)
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel() // run subtests concurrently

            got, err := Divide(tt.a, tt.b)
            if (err != nil) != tt.wantErr {
                t.Fatalf("Divide(%d,%d) error = %v; wantErr %v", tt.a, tt.b, err, tt.wantErr)
            }
            if got != tt.want {
                t.Errorf("Divide(%d,%d) = %v; want %v", tt.a, tt.b, got, tt.want)
            }
        })
    }
}
```

`t.Run(name, fn)` creates a **subtest** — each appears separately in the output, so a failure
tells you exactly which case broke. This pattern is the gold standard in Go.

> The `tt := tt` line before `t.Parallel()` prevents a classic loop-variable capture bug in
> older Go versions (fixed by default in Go 1.22+, but harmless to keep).

---

## Comparing Results

For non-primitive types, use `reflect.DeepEqual`:

```go
import "reflect"

want := []int{3, 1, 2}
got := SortInts(input)
if !reflect.DeepEqual(got, want) {
    t.Errorf("got %v; want %v", got, want)
}
```

---

## Test Fixtures and Helpers

Extract setup into helper functions or use `t.TempDir()` for a temp directory that's
auto-cleaned:

```go
func TestWriteFile(t *testing.T) {
    dir := t.TempDir() // created and removed automatically
    path := filepath.Join(dir, "test.txt")

    if err := os.WriteFile(path, []byte("hello"), 0644); err != nil {
        t.Fatalf("setup failed: %v", err)
    }

    data, err := os.ReadFile(path)
    if err != nil {
        t.Fatalf("read failed: %v", err)
    }
    if string(data) != "hello" {
        t.Errorf("got %q; want %q", data, "hello")
    }
}
```

---

## Benchmarks

A `Benchmark...` function measures performance (run with `go test -bench=.`):

```go
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ { // b.N is chosen automatically
        _ = Add(1, 2)
    }
}
```

```bash
go test -bench=. -benchmem    # -benchmem shows allocations
```

Use `b.ResetTimer()` to exclude setup time from the measurement.

---

## Test Coverage

See how much of your code the tests exercise:

```bash
go test -cover ./...            # coverage percentage
go test -coverprofile=cover.out ./...
go tool cover -html=cover.out   # open a browser report
go tool cover -func=cover.out   # per-function coverage
```

Coverage measures which lines ran, not whether the assertions are meaningful — pair it with
good table-driven cases.

---

## Test Main and Helpers

For package-wide setup/teardown, define `TestMain`:

```go
func TestMain(m *testing.M) {
    setup()        // run before all tests
    code := m.Run() // run all tests
    teardown()     // run after
    os.Exit(code)
}
```

---

## Skipping and Timing

```go
func TestSlow(t *testing.T) {
    if testing.Short() {
        t.Skip("skipping in short mode")
    }
    // ...
}
```

Run with `go test -short` to skip slow tests during rapid iteration.

---

## Key Takeaways

- Tests live in `_test.go` files; run them with `go test ./...` (`-v` for verbose).
- Use `t.Errorf` (continue) vs `t.Fatalf` (stop); `t.Run` creates named **subtests**.
- The **table-driven** pattern with a `[]struct{...}` of cases is the idiomatic Go approach.
- Use `reflect.DeepEqual` to compare non-primitives and `t.TempDir()` for temp files.
- `Benchmark...` functions (`go test -bench=.`) measure performance; `-cover` reports coverage.
- `TestMain` handles package-wide setup; `testing.Short()` gates slow tests.

---

This completes the Go core notes. You now have the full set: syntax, functions, structs,
maps, slices, goroutines, channels, pointers, error handling, JSON, and testing — enough to
build and verify real Go services.
