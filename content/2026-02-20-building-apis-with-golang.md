---
title: Building Resilient APIs with Golang
date: 2026-02-20
category: golang
tags: [Go, Backend, API, Concurrency]
excerpt: How I structure Go HTTP services for clarity and speed — from routing and middleware to graceful shutdown and structured logging.
---

# Building Resilient APIs with Golang

Go's simplicity is deceptive: the language gives you little, which forces you
to make deliberate choices about structure. Here's the pattern I reach for when
standing up a new service.

## Keep `main` tiny

The entrypoint should wire dependencies and start the server — nothing more.

```go
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	srv := &http.Server{Addr: ":8080", Handler: mux}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
}
```

## Middleware as composition

Wrap handlers instead of reaching for a heavy framework:

```go
func withLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
	})
}
```

## Concurrency without footguns

- Use `errgroup` for related goroutines that should fail together.
- Never share a `[]byte` buffer across goroutines without a pool.
- Prefer channels for ownership transfer, mutexes for shared state.

> Measure before optimizing. `pprof` is built in — use it before guessing.

## The result

A service that starts in milliseconds, shuts down cleanly, and is boring in the
best way: it just works.
