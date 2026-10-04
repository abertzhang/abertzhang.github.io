---
title:"Golang Channels and select"
create:2026-10-04
update:2026-10-04
category:Golang
tags:[golang,channel,concurrency]
summary:"Coordinate goroutines with channels — creating buffered and unbuffered channels, sending and receiving, closing, the select statement, timeouts with time.After, and the worker pool pattern."
top:1
copyright:true
---

# Golang Channels and select

Goroutines let you run work concurrently; **channels** are how they communicate and
synchronize safely without shared mutable state. Channels are Go's signature concurrency tool
and the reason you rarely need locks in idiomatic Go.

---

## Creating a Channel

```go
ch := make(chan int)        // unbuffered: send and receive rendezvous
ch := make(chan int, 100)   // buffered: holds up to 100 values
```

A channel carries values of a single type and (by default) is safe for concurrent use.

---

## Sending and Receiving

```go
ch := make(chan int)

go func() {
    ch <- 42 // send (blocks until someone receives)
}()

value := <-ch // receive (blocks until a value is available)
fmt.Println(value) // 42
```

The `<-` operator both receives from and sends to a channel depending on which side it's on.

---

## Unbuffered vs Buffered

### Unbuffered (default) — a rendezvous

A send blocks until a receiver is ready. This creates a tight **synchronization point** between
goroutines.

```go
ch := make(chan int)
go func() { ch <- 1 }()  // blocks until received
fmt.Println(<-ch)       // 1
```

### Buffered — a small queue

A send succeeds immediately as long as there's room; the receiver drains later. This decouples
producers and consumers and smooths bursts.

```go
ch := make(chan int, 2)
ch <- 1 // OK, buffered
ch <- 2 // OK, buffered
ch <- 3 // BLOCKS — buffer full, no receiver
fmt.Println(<-ch) // 1
```

---

## Closing a Channel

A channel is closed to signal that **no more values will be sent** (not to stop receiving).

```go
ch := make(chan int)
ch <- 1
close(ch) // sender closes

v, ok := <-ch // ok==true, v==1
v, ok = <-ch  // ok==false — receive from closed, zero-value channel
```

Rules:
- Only the **sender** should close a channel.
- Receivers detect closure with the two-value form `v, ok := <-ch`.
- Sending on a closed channel **panics**; receiving from a closed channel is safe (returns zeros).
- A `for range ch` loop ends automatically when the channel is closed.

```go
// Producer
go func() {
    for i := 1; i <= 3; i++ {
        ch <- i
    }
    close(ch) // signal "done"
}()

// Consumer — stops automatically on close
for v := range ch {
    fmt.Println(v) // 1, 2, 3
}
```

---

## The select Statement

`select` waits on **multiple** channel operations, taking whichever is ready first — like a
non-blocking `switch` for concurrency.

```go
select {
case msg := <-messages:
    fmt.Println("got:", msg)
case result := <-results:
    fmt.Println("result:", result)
case ch <- outgoing:
    fmt.Println("sent")
}
```

### default (non-blocking)

If no case is ready, `default` runs immediately — use it to avoid blocking.

```go
select {
case v := <-ch:
    fmt.Println(v)
default:
    fmt.Println("nothing ready")
}
```

### Timeouts (very common)

```go
select {
case result := <-results:
    fmt.Println("got:", result)
case <-time.After(2 * time.Second):
    fmt.Println("timed out")
}
```

Combine with `time.Tick` to implement a heartbeat or rate loop.

---

## Directional Channels

You can restrict a channel to send-only or receive-only to make intent clear and prevent bugs:

```go
func producer(out chan<- int) { // send-only
    out <- 1
}

func consumer(in <-chan int) {  // receive-only
    v := <-in
    _ = v
}
```

## Nil Channels

A **nil** channel blocks forever. `select` on a nil channel simply never picks that case — handy
for dynamically disabling options.

```go
var disabled chan int // nil
select {
case v := <-active:
    use(v)
case v := <-disabled: // never ready
    use(v)
}
```

---

## Worker Pool Pattern

A classic use of buffered channels: N workers pulling tasks from a queue.

```go
func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)

    // Start workers
    for w := 1; w <= 3; w++ {
        go func() {
            for job := range jobs { // exits when jobs is closed
                results <- job * 2
            }
        }()
    }

    // Send jobs
    for j := 1; j <= 9; j++ {
        jobs <- j
    }
    close(jobs) // tell workers no more jobs

    // Collect results
    total := 0
    for i := 0; i < 9; i++ {
        total += <-results
    }
    fmt.Println("total:", total) // 2+4+...+18 = 90
}
```

The buffered channels let producers/consumers run without blocking each other, while `close`
coordinates shutdown cleanly.

---

## Key Takeaways

- Channels are typed, concurrency-safe pipes for values between goroutines.
- **Unbuffered** = a rendezvous (synchronize); **buffered** = a queue (decouple).
- The **sender** closes a channel; receivers detect it with `v, ok := <-ch`, and `for range` stops on close.
- `select` waits on multiple channels; add `default` for non-blocking, `time.After` for timeouts.
- Directional types (`chan<- T`, `<-chan T`) document intent; a nil channel blocks forever in `select`.
- The **worker pool** (buffered jobs channel + N workers) is the workhorse concurrency pattern.

Next up: **Pointers and Memory** — value vs reference semantics in Go.
