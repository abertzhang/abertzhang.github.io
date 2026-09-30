---
title:Golang Structs
create:2026-09-30
update:2026-09-30
category:Golang
tags:[golang,struct]
summary:Struct definition and initialization, field access, nesting vs. embedding, methods with value/pointer receivers, anonymous structs, generic structs.
top:1
copyright:true
---

# Go Study Notes: Structs

> Adapted from the Juejin article *"Go Language Chapter 6 (Structs)"* ([original](https://juejin.cn/post/7670398642598019118)) by 小满zs.
> A struct is a **composite data type** in Go that combines values of different types into one new data type.

In everyday code, structs are the natural way to describe objects such as "a person", "a car", or "an order".

---

## 1. Defining a Struct

Use `type` + `struct` to define a new type:

```go
type Name struct {
	field Type
	field Type
	field Type
}
```

Example: define a `Person` with a name, age, and hobbies:

```go
package main

import "fmt"

type Person struct {
	Name  string
	Age   int
	Hobby []string
}

func main() {
	person := Person{
		Name:  "John",
		Age:   20,
		Hobby: []string{"reading", "swimming"},
	}
	fmt.Println(person)
}
```

`Person{...}` is a **composite literal**: fields are assigned by name, order does not matter, and any field left out gets that type's zero value.

### 1.1 Reading and writing fields

Access and modify fields with `.`:

```go
package main

import "fmt"

type Person struct {
	Name string
	Age  int
}

func main() {
	p := Person{Name: "John", Age: 18}
	fmt.Println(p.Name) // John

	p.Age = 20
	fmt.Println(p.Age) // 20
}
```

### 1.2 Ways to initialize

```go
package main

import "fmt"

type Person struct {
	Name string
	Age  int
}

func main() {
	// 1. By field name (recommended — readable)
	p1 := Person{Name: "John", Age: 18}

	// 2. By field order (error-prone with many fields — not recommended)
	p2 := Person{"Jane", 20}

	// 3. Set only some fields; the rest are zero values
	p3 := Person{Name: "Wang Wu"} // Age is 0

	// 4. Declare first, assign later (all zero values initially)
	var p4 Person
	p4.Name = "Zhao Liu"
	p4.Age = 22

	// 5. Take the address — yields a *Person
	p5 := &Person{Name: "Qian Qi", Age: 25}

	fmt.Println(p1, p2, p3, p4, p5)
}
```

When accessing a field through the pointer `p5`, Go **auto-dereferences**: write `p5.Name`, not `(*p5).Name`.

---

## 2. Nested Structs

A struct may contain a field whose type is another struct, composing more complex data:

```go
package main

import "fmt"

type Car struct {
	Brand string
	Model string
	Year  int
}

type Person struct {
	Name  string
	Age   int
	Hobby []string
	Car   Car
}

func main() {
	person := Person{
		Name:  "John",
		Age:   20,
		Hobby: []string{"reading", "swimming"},
		Car: Car{
			Brand: "Toyota",
			Model: "Camry",
			Year:  2020,
		},
	}
	fmt.Println(person)
	fmt.Println(person.Car.Brand) // Toyota
}
```

Here `Car` is a **named field**, so you access it via the full path `person.Car.Brand`.

---

## 3. Embedded Structs

If a field has **no field name**, only a type, it is an *embedded* (anonymous) field. Once embedded, the embedded type's fields and methods are **promoted** to the outer struct and can be used directly:

```go
package main

import "fmt"

type Car struct {
	Brand string
	Model string
	Year  int
}

type Person struct {
	Name string
	Age  int
	Car        // embedded: no field name, just the type
}

func main() {
	person := Person{
		Name: "John",
		Age:  20,
		Car: Car{
			Brand: "Toyota",
			Model: "Camry",
			Year:  2020,
		},
	}

	// Promoted access works directly
	fmt.Println(person.Brand) // Toyota
	// The full path still works too
	fmt.Println(person.Car.Model) // Camry
}
```

> **Nested vs. embedded**: nesting is "composition with a name"; embedding is "promoting another type's capabilities into the outer type". Both combine data, but embedding better expresses an "is-a / has-the-ability" relationship.

---

## 4. Methods

A method is "a function bound to a type". The receiver goes between `func` and the method name:

```go
func (recv Type) MethodName(params) result {
	// ...
}
```

### 4.1 Value receiver

```go
package main

import "fmt"

type Person struct {
	Name string
	Age  int
}

func (p Person) Introduce() {
	fmt.Printf("My name is %s, I am %d years old\n", p.Name, p.Age)
}

func main() {
	p := Person{Name: "John", Age: 18}
	p.Introduce() // My name is John, I am 18 years old
}
```

A value receiver works on a **copy**, so changing a field inside the method does **not** affect the original variable.

### 4.2 Pointer receiver

Use a pointer receiver when the method must modify the struct itself:

```go
package main

import "fmt"

type Person struct {
	Name string
	Age  int
}

func (p *Person) GrowUp() {
	p.Age++
}

func (p Person) Introduce() {
	fmt.Printf("My name is %s, I am %d years old\n", p.Name, p.Age)
}

func main() {
	p := Person{Name: "John", Age: 18}
	p.GrowUp()    // equivalent to (&p).GrowUp()
	p.Introduce() // My name is John, I am 19 years old
}
```

Calling `p.GrowUp()` is enough — Go **takes the address automatically**.

> **Convention**: use a pointer receiver to mutate state; a value receiver suits read-only access and small structs. Keep the style **consistent** within a type — don't mix value and pointer receivers arbitrarily.

---

## 5. Anonymous Structs

Without a prior `type` definition, write `struct { ... }` right where it is used. This suits one-off situations:

```go
package main

import "fmt"

func main() {
	person := struct {
		Name string
		Age  int
	}{
		Name: "John",
		Age:  20,
	}
	fmt.Println(person.Name, person.Age)
}
```

Anonymous structs are handy for configuration, single-return values, test data, and other "use once and discard" shapes. If reused in several places, giving it a name is clearer.

---

## 6. Generic Structs

Since Go 1.18, structs can take type parameters:

```go
package main

import "fmt"

type Person[T string | int] struct {
	Name  string
	Age   int
	Phone T
}

func main() {
	person := Person[string]{
		Name:  "John",
		Age:   20,
		Phone: "010-10086",
	}
	person2 := Person[int]{
		Name:  "John",
		Age:   20,
		Phone: 10086,
	}
	fmt.Println(person)
	fmt.Println(person2)
}
```

`Person[T string | int]` means `Phone` may only be `string` or `int`. When creating an instance you must specify the concrete type, e.g. `Person[string]` or `Person[int]`.

---

## 7. Exercises

1. **Definition and initialization**: define a `Book` struct (title, author, pages), create instances in at least two ways, and print them.
2. **Nesting**: define `Address` (city, street) and `User` (name, address). Create a user and print "name lives on street in city".
3. **Embedding**: change the previous exercise so `Address` is embedded into `User`, and print the city directly via the promoted field.
4. **Methods**: give `Book` a value-receiver method `Info()` that prints its info; then add a pointer-receiver method `AddPages(n int)` that increases the page count — verify the count changes after calling it.
5. **Combined**: define `Rectangle` (width, height) with methods `Area()` and `Perimeter()` returning the area and perimeter, and verify them in `main`.

---

## 8. Key Takeaways

- **Definition**: `type Name struct { ... }` — declare a new type with `type` + `struct`.
- **Initialization**: prefer **by field name** (readable, partial fields allowed); positional init is error-prone.
- **Access**: read/write fields with `.`; accessing fields through a struct pointer auto-dereferences (`p.Name`, not `(*p).Name`).
- **Nesting**: a named field — use the full path `person.Car.Brand`.
- **Embedding**: an anonymous field — fields/methods are **promoted**, so `person.Brand` works directly.
- **Methods**: the receiver sits between `func` and the method name; a **value receiver** works on a copy (no mutation), a **pointer receiver** can mutate; keep the style consistent per type.
- **Anonymous structs**: one-off data shapes, defined inline.
- **Generic structs**: Go 1.18+ supports `type Name[T Constraint] struct { ... }`.

---

*Reference: [Go Language Chapter 6 (Structs)](https://juejin.cn/post/7670398642598019118) · Author: 小满zs*
