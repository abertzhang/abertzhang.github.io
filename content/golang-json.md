---
title:"Golang encoding/json"
create:2026-10-04
update:2026-10-04
category:Golang
tags:[golang,json,marshal]
summary:"Handle JSON in Go — marshaling structs to JSON with struct tags, unmarshaling into structs and maps, omitempty and pointer fields, custom marshalers, and streaming with Encoder and Decoder."
top:1
copyright:true
---

# Golang encoding/json

The `encoding/json` package converts Go values to and from JSON. It works with **structs**,
**maps**, and **slices** out of the box, and **struct tags** let you control the exact JSON
field names and behavior.

---

## Marshaling: Struct → JSON

`json.Marshal` turns a Go value into a JSON **byte slice**.

```go
import "encoding/json"

type User struct {
    Name  string `json:"name"`
    Email string `json:"email"`
    Age   int    `json:"age"`
}

u := User{Name: "Ada", Email: "ada@example.com", Age: 36}

data, err := json.Marshal(u)
if err != nil {
    log.Fatal(err)
}
fmt.Println(string(data))
// {"name":"Ada","email":"ada@example.com","age":36}
```

The `json:"name"` tag tells the encoder to use `name` as the JSON key (Go's default would be
the capitalized field name `Name`).

---

## Struct Tags

Struct tags (a string literal after the type) configure JSON behavior:

```go
type Product struct {
    ID       int     `json:"id"`
    Name     string  `json:"name"`
    Price    float64 `json:"price"`
    Secret   string  `json:"-"`         // never serialize
    Internal string  `json:"internal,omitempty"` // omit if empty
    Optional *string `json:"optional"` // pointer: can be null
}
```

Common tag options:
- `json:"name"` — the JSON key.
- `json:"-"` — exclude the field entirely.
- `json:"name,omitempty"` — omit the field if it's a zero value (`""`, `0`, `nil`, empty slice/map).
- `json:"name,string"` — encode the value as a quoted string (for `int64` that might exceed
  JavaScript's safe integer range).

`omitempty` is the one you will use most — it keeps JSON small and clean.

---

## Unmarshal: JSON → Struct

```go
var u User
if err := json.Unmarshal(data, &u); err != nil {
    log.Fatal(err)
}
fmt.Println(u.Name) // "Ada"
```

Pass a **pointer** (`&u`) so the decoder can write into your variable.

Unmarshal into a map when the shape is dynamic:

```go
var m map[string]interface{}
json.Unmarshal(data, &m)
fmt.Println(m["name"]) // "Ada"
```

Or into a slice of structs:

```go
var users []User
json.Unmarshal(data, &users)
```

---

## Indenting (MarshalIndent)

For human-readable output (files, logs):

```go
data, _ := json.MarshalIndent(u, "", "  ") // prefix="", indent="  spaces"
fmt.Println(string(data))
```

```json
{
  "name": "Ada",
  "email": "ada@example.com",
  "age": 36
}
```

---

## Streaming: Encoder and Decoder

For multiple JSON objects (e.g. a stream of events or a large file), use `Encoder`/`Decoder`
so you don't build the whole thing in memory.

```go
// Encode (write) JSON objects one by one
enc := json.NewEncoder(os.Stdout)
enc.SetIndent("", "  ")
enc.Encode(User{Name: "Ada"}) // writes one object + newline

// Decode (read) a stream of JSON objects
dec := json.NewDecoder(file)
for {
    var u User
    if err := dec.Decode(&u); err == io.EOF {
        break
    } else if err != nil {
        log.Fatal(err)
    }
    fmt.Println(u.Name)
}
```

`Encoder.Encode` appends a newline, which produces **JSON Lines** (NDJSON) — a common
log-friendly format.

---

## Handling Unknown Fields and nulls

By default `Unmarshal` **ignores** unknown keys (good for forward compatibility). To be strict:

```go
dec := json.NewDecoder(strings.NewReader(`{"name":"Ada","extra":1}`))
dec.DisallowUnknownFields() // error on "extra"
```

`json.Unmarshal` tolerates a JSON `null` for most types (leaves the zero value). A `null` into
a non-pointer non-slice/map field is a no-op.

---

## Custom JSON Behavior

### MarshalJSON / UnmarshalJSON

Implement these to control exactly how a type serializes:

```go
type Celsius float64

func (c Celsius) MarshalJSON() ([]byte, error) {
    return json.Marshal(float64(c)*9/5 + 32) // store as Fahrenheit
}

func (c *Celsius) UnmarshalJSON(b []byte) error {
    var f float64
    if err := json.Unmarshal(b, &f); err != nil {
        return err
    }
    *c = Celsius((f - 32) * 5 / 9)
    return nil
}
```

### Embedding and field promotion

Embedded structs are flattened in JSON:

```go
type Base struct {
    ID string `json:"id"`
}
type Item struct {
    Base             // promoted — id appears at the top level
    Name string `json:"name"`
}
```

---

## Common Pitfalls

- **Forgetting the tag** — without it you get `Name` not `name`; add tags for clean API contracts.
- **Passing a value to Unmarshal** — you need `&v`, else nothing is written.
- **Forgetting to check the error** — `json.Marshal`/`Unmarshal` return errors; handle them.
- **Ignoring `omitempty` on zero-ish structs** — pointers + `omitempty` give you "absent vs empty" control.
- **Large `int64` in JSON** — tag with `,string` so JavaScript clients don't lose precision.

---

## Key Takeaways

- `json.Marshal` (→ bytes) and `json.Unmarshal` (&value) convert between Go and JSON.
- Use `json:"name"` struct tags to control keys; `json:"-"` to exclude, `,omitempty` to skip empties.
- `json.MarshalIndent(v, "", "  ")` pretty-prints.
- `json.NewEncoder`/`NewDecoder` stream objects (great for NDJSON and large files).
- Pointers let a field be `null` and give you "absent vs empty" control; `,string` protects big ints.
- Implement `MarshalJSON`/`UnmarshalJSON` for custom types; embedded structs flatten in JSON.

Next up: **Testing in Go** — the built-in `testing` package and table-driven tests.
