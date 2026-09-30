---
title:Golang Goroutines
create:2026-09-30
update:2026-09-30
category:Golang
tags:[golang,goroutine,concurrency]
summary:Starting goroutines with go, main ending kills them, why not to wait with Sleep, sync.WaitGroup (pass by pointer), the loop-variable closure trap, and usage guidance.
top:1
copyright:true
---

# Go Study Notes: Goroutines

> Adapted from the Juejin article *"Go Language Chapter 11 (Goroutines)"* ([original](https://juejin.cn/post/7682601317679841280)) by 小满zs.
> Ordinary functions run sequentially: the next one does not begin until the current one finishes. A **goroutine** lets you **run several pieces of logic at the same time**.

For example: querying an order, sending an SMS, and writing a log simultaneously, without blocking one another.

Go's goroutines are scheduled by the runtime and are lighter than OS threads. At the beginning, remember three things:

1. Start a goroutine with `go`.
2. When `main` ends, the whole program ends — other goroutines are killed immediately.
3. To "wait for them all to finish", use `sync.WaitGroup`.

> Passing **data between goroutines** is mainly done with `channel`. Channels are a bigger topic and get **their own article**; this one only covers "how to start" and "how to wait".

---

## 1. Creating a Goroutine

Put `go` in front of a function call and it runs in a new goroutine, **without blocking the current code**:

```go
package main

import (
	"fmt"
	"time"
)

func say(msg string) {
	fmt.Println(msg)
}

func main() {
	go say("Hello, goroutine")
	fmt.Println("Hello, main")

	// Wait briefly, otherwise main returns too fast and the goroutine may not print
	time.Sleep(time.Millisecond * 100)
}
```

The output order is not guaranteed; commonly it looks like:

```text
Hello, main
Hello, goroutine
```

You can also `go` an anonymous function directly:

```go
go func() {
	fmt.Println("anonymous goroutine")
}()
```

---

## 2. Pitfall: When `main` Ends, Goroutines Die Too

The following often prints **nothing at all** (or occasionally a single line):

```go
package main

import "fmt"

func main() {
	go func() {
		fmt.Println("I may not get to print")
	}()
	// main returns immediately, the program exits
}
```

Why: `go` only *starts* the goroutine; it does not guarantee it finishes. As soon as `main` ends, the process exits and other goroutines are terminated.

### 2.1 Why You Shouldn't Wait with `Sleep`

With several goroutines, each task takes a **different, hard-to-guess** amount of time. Writing `time.Sleep(xxx)` in `main` means you picked the duration yourself:

- **Too short**: some goroutines haven't finished, the program exits, results are lost.
- **Too long**: the work finished long ago, yet you keep waiting — wasted time.

So the proper approach is not "guess a delay" but to use **`sync.WaitGroup`** from the standard library: each goroutine reports in when done, and you proceed once all have reported.

---

## 3. Waiting with WaitGroup

`sync.WaitGroup` acts like a counter:

| Method | Purpose |
|--------|---------|
| `Add(n)` | Add `n` to the counter (add as many as the tasks you are about to start) |
| `Done()` | Subtract `1` (call once when a task finishes) |
| `Wait()` | Block until the counter reaches `0` |

**Convention**: call `Done()` when each goroutine ends, usually as `defer wg.Done()` so it can't be missed.

### 3.1 Example: Handling Multiple Orders Concurrently

Simulate sending a "shipping notice" for 3 orders. Each notice takes a different amount of time — if you wait with `Sleep` you have no idea how long to sleep; with `WaitGroup` there is nothing to guess.

#### Wrong approach (guessing a delay)

```go
package main

import (
	"fmt"
	"time"
)

func notify(orderID string, cost time.Duration) {
	time.Sleep(cost) // this Sleep merely simulates work; it is NOT for waiting on goroutines
	fmt.Println("notified order:", orderID)
}

func main() {
	go notify("A1001", 200*time.Millisecond)
	go notify("A1002", 100*time.Millisecond)
	go notify("A1003", 150*time.Millisecond)

	// 120ms guessed: A1002 may print, A1001 / A1003 probably won't
	time.Sleep(120 * time.Millisecond)
	fmt.Println("all done? — not necessarily")
}
```

#### Correct approach (`sync.WaitGroup`)

`wg` is declared inside `main`, so the outside function `notify` **cannot see** that variable — just like any ordinary local variable. Therefore you must pass its address **`&wg`** as a parameter, and the signature becomes `wg *sync.WaitGroup`.

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// the third parameter takes a *WaitGroup pointer, otherwise main's wg is unreachable
func notify(orderID string, cost time.Duration, wg *sync.WaitGroup) {
	defer wg.Done() // when this goroutine ends, counter -1

	time.Sleep(cost) // only simulates "send SMS / call API" — unrelated to waiting
	fmt.Println("notified order:", orderID)
}

func main() {
	var wg sync.WaitGroup // declared in main: usable by main and the function it's passed into

	orders := []struct {
		id   string
		cost time.Duration
	}{
		{"A1001", 200 * time.Millisecond},
		{"A1002", 100 * time.Millisecond},
		{"A1003", 150 * time.Millisecond},
	}

	wg.Add(len(orders)) // tell WaitGroup: wait for 3 in total
	for _, o := range orders {
		go notify(o.id, o.cost, &wg) // pass the address, not a copy
	}

	wg.Wait() // no guessing: continues only after all three Done calls
	fmt.Println("all notifications complete")
}
```

If passing parameters feels clunky, you can write the logic as an anonymous function inside `main` and use `wg` via the closure (same effect):

```go
wg.Add(1)
go func(id string, cost time.Duration) {
	defer wg.Done()
	time.Sleep(cost)
	fmt.Println("notified order:", id)
}(o.id, o.cost)
```

Pick either style: **standalone function → must pass `*sync.WaitGroup`; anonymous function → can use the outer `wg` directly.**

Output like this (order may vary):

```text
notified order: A1002
notified order: A1003
notified order: A1001
all notifications complete
```

### 3.2 Comparison: Sleep vs. WaitGroup

| `time.Sleep` | `sync.WaitGroup` |
|---|---|
| Based on a duration you chose — inaccurate | Each goroutine reports in with `Done()` |
| Tasks slower than expected → early exit, lost results | Automatically waits a bit longer |
| Tasks faster → you still idle | Proceeds as soon as work is done |
| Fine for a quick "goroutines can run" demo | **The proper way to wait for multiple goroutines** |

> **Three points to remember:**
> 1. When `wg` lives in `main`, an outer named function **cannot see it** — add a parameter `wg *sync.WaitGroup` and pass `&wg`.
> 2. Always pass a **pointer**. With a value parameter (`wg sync.WaitGroup`) the goroutine calls `Done` on a copy, and `main`'s `Wait` never returns.
> 3. Call `Add` **before** starting goroutines; call `Done` **inside** the goroutine.

### 3.3 Example: Computing Totals Concurrently

Several students each have subject scores, summed in separate goroutines (here we use a local variable and avoid multiple goroutines writing the same variable):

```go
package main

import (
	"fmt"
	"sync"
)

func sumScores(name string, scores []int, wg *sync.WaitGroup) {
	defer wg.Done()

	total := 0
	for _, s := range scores {
		total += s
	}
	fmt.Printf("%s total: %d\n", name, total)
}

func main() {
	var wg sync.WaitGroup

	students := map[string][]int{
		"Xiaoman": {90, 85, 88},
		"John":    {70, 92, 80},
		"Jane":    {95, 91, 89},
	}

	wg.Add(len(students))
	for name, scores := range students {
		// copy the loop variables before passing them in, to avoid the closure trap
		n, s := name, scores
		go sumScores(n, s, &wg)
	}

	wg.Wait()
	fmt.Println("done")
}
```

> When launching goroutines inside a loop, always **copy the loop variables** (`name`, `scores`) into new variables before passing them in. Otherwise several goroutines may all use the value from the **last iteration** (especially common before Go 1.22). The habit of writing `n, s := name, scores` is the safest bet.

---

## 4. Closure Parameters, Emphasized Again

**Wrong** (easy trap):

```go
for _, name := range names {
	go func() {
		fmt.Println(name) // may all print the last name
	}()
}
```

**Correct**: pass the value in as a parameter:

```go
for _, name := range names {
	go func(n string) {
		fmt.Println(n)
	}(name)
}
```

---

## 5. How to Choose (Beginner's Guide)

| Scenario | Recommendation |
|----------|----------------|
| Plain sequential business logic | Just call ordinary functions — no goroutines needed |
| Several independent tasks should run at once | `go` + `sync.WaitGroup` |
| Want to "continue only after all are done" | Use `wg.Wait()`; **do not** guess a `Sleep` in `main` |
| Where `Sleep` is appropriate | Simulating work (sending SMS, calling APIs); **not** for waiting on goroutines |
| Passing results / messages between goroutines | Use `channel` (**next article**) |
| Multiple goroutines mutating the same data (e.g. one `map`) | Don't do it yet; when needed, use a lock or serialize with a channel |

**At the beginning, master this: start → don't let `main` leave early → wait with `sync.WaitGroup` (don't guess delays).** Safe sharing of data is a later topic.

---

## 6. Exercises

1. **Start a goroutine**: write `hello(name string)` that prints `Hello, xxx`. Call it with `go` in `main`, then wait briefly with `time.Sleep` before ending (just to feel that "goroutines run"; here `Sleep` is only a crude demo).
2. **Guessing delays is unreliable**: start 3 goroutines that `Sleep` 50ms / 200ms / 100ms respectively and then print. In `main`, only `Sleep(80ms)` before printing "end". Observe which output is lost, and in a sentence or two explain why you shouldn't guess delays for multiple goroutines.
3. **WaitGroup basics**: rewrite the previous exercise with `sync.WaitGroup`: print "end" only after all three tasks have called `Done`. Confirm you see all output every time.
4. **Concurrent notifications**: given the order slice `[]string{"O1", "O2", "O3", "O4"}`, have each order `Sleep` 50 milliseconds in a goroutine and then print "processed: orderID". Use `WaitGroup` to wait for all of them, then print "cashier closed".
5. **Combined**: define `download(file string, wg *sync.WaitGroup)` that `Sleep`s 100 milliseconds and prints "downloaded: filename". The file list is `[]string{"a.txt", "b.txt", "c.txt"}`. Launch downloads with a loop + `go`, mind the loop-variable copy (or pass them as parameters), finally `Wait` and print "all downloads complete".

---

## 7. Key Takeaways

- **Start**: put `go` before a function call; also `go func(){...}()` works.
- **`main` ending = program ending**; other goroutines are killed immediately.
- **Don't wait with `Sleep`**: too short loses results, too long wastes time.
- **`sync.WaitGroup`**: `Add(n)` adds, `Done()` subtracts (usually `defer wg.Done()`), `Wait()` blocks until zero.
- **Always pass `WaitGroup` as a pointer** `*sync.WaitGroup`; a value copy makes `Wait` hang forever.
- **Call `Add` before launching, `Done` inside the goroutine.**
- **Goroutines in a loop**: copy loop variables (`n, s := name, scores`) or pass them as parameters, so the closure doesn't capture the last value.
- **Use `channel` to pass data between goroutines** (next article); guard shared data with locks or serialization.

---

*Reference: [Go Language Chapter 11 (Goroutines)](https://juejin.cn/post/7682601317679841280) · Author: 小满zs*
