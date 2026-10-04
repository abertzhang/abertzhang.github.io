---
title:"Express Routing and Middleware in Depth"
create:2026-10-04
update:2026-10-04
category:nodejs
tags:[nodejs,express,routing,middleware]
summary:"Master Express request flow — express.Router, route parameters, query strings and wildcards, middleware ordering, centralized error handling, and practical patterns."
top:1
copyright:true
---

# Express Routing and Middleware in Depth

Express is really two ideas: **routes** (URL → handler) and **middleware** (functions that run
in order). Once the ordering rules click, Express stops feeling magical. This note digs into
`express.Router`, params, query, middleware order, and error handling.

---

## app vs express.Router

As an app grows, defining every route on `app` gets messy. `express.Router` creates a
mini-router you can mount at a prefix — the standard way to organize a real app.

**routes/users.js**

```javascript
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json(users));            // GET  /api/users
router.get('/:id', (req, res) => res.json(getUser(req.params.id))); // GET /api/users/:id
router.post('/', (req, res) => res.status(201).json(create(req.body))); // POST /api/users

module.exports = router;
```

**app.js**

```javascript
const express = require('express');
const app = express();
const userRoutes = require('./routes/users');

app.use(express.json());
app.use('/api/users', userRoutes);  // mount the router under a prefix

app.listen(3000);
```

The `router.get('/')` handler now responds at `/api/users`. Splitting routes into modules
keeps each file focused.

---

## Route Parameters

`:param` in a path becomes `req.params`:

```javascript
app.get('/users/:id/posts/:postId', (req, res) => {
  res.json({
    userId: req.params.id,      // '42'
    postId: req.params.postId,  // '7'
  });
});
```

Optional params use `?`; a wildcard `*splat` captures the rest:

```javascript
app.get('/files/*path', (req, res) => {
  res.json({ path: req.params[0] }); // everything after /files/
});
```

---

## Query Strings vs Params

- **Params** (`/users/42`) identify **which resource** — part of the path.
- **Query** (`/users?sort=name`) modify **how it's returned** — after the `?`.

```javascript
app.get('/users', (req, res) => {
  const { sort, page = 1, limit = 10 } = req.query; // defaults when absent
  res.json({ sort, page, limit });
});
```

```javascript
// GET /users?sort=name&page=2
// req.query = { sort: 'name', page: '2' }
```

Values in `req.query` are always strings; cast as needed (`Number(req.query.page)`).

---

## Middleware Order Matters

`app.use` middleware run in the order they're registered. Anything registered **after** a
route only sees requests that route didn't handle.

```javascript
app.use((req, res, next) => { console.log('1 - always first'); next(); });

app.get('/special', (req, res) => { res.send('handles /special'); });

app.use((req, res, next) => { console.log('2 - NOT run for /special'); next(); });
```

Mount auth/logger middleware **before** the routes that need them.

---

## Chained Middleware for a Route

Multiple handlers can guard a single route — useful for auth + validation + handler:

```javascript
function logRequest(req, res, next) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Login required' });
  req.user = { id: 1 }; // pretend we verified the token
  next();
}

app.get('/profile', logRequest, requireAuth, (req, res) => {
  res.json({ user: req.user });
});
```

Each handler either sends a response (stopping the chain) or calls `next()` to continue.

---

## Error-Handling Middleware

An error handler has **four** parameters — that's how Express recognizes it. Register it last.

```javascript
app.get('/boom', (req, res, next) => {
  throw new Error('Something broke'); // Express catches thrown/rejected errors
});

// ...all routes...

// 4 args => error handler (err, req, res, next)
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});
```

For async errors in Express 4, wrap with a helper or forward manually (Express 5 auto-forwards
rejected promises):

```javascript
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/api/data', asyncHandler(async (req, res) => {
  const data = await fetchSomething(); // if this rejects, next(err) is called
  res.json(data);
}));
```

---

## 404 Catch-All

Register a final handler to return JSON 404s for anything unrouted (after real routes):

```javascript
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});
```

---

## Common Patterns

### Router-level middleware

```javascript
// routes/admin.js — protect the whole router
const router = require('express').Router();
router.use(requireAuth);            // runs for every route in this router
router.get('/stats', (req, res) => res.json(getStats()));
module.exports = router;

// app.js
app.use('/admin', require('./routes/admin'));  // /admin/stats now requires auth
```

### Conditional routing

```javascript
app.use('/v1', v1Router);
app.use('/v2', v2Router); // different versions of the same API
```

### Sanitizing input in middleware

```javascript
app.use((req, res, next) => {
  if (typeof req.query.name === 'string') {
    req.query.name = req.query.name.trim().slice(0, 100);
  }
  next();
});
```

---

## Key Takeaways

- Use `express.Router()` + `app.use('/prefix', router)` to organize routes into modules.
- `:param` → `req.params`; `?key=value` → `req.query` (always strings).
- Middleware run in registration order; register logging/auth **before** routes.
- A handler either responds or calls `next()`; `app.use(mw, route, handler)` chains several.
- Error middleware has **4 args** `(err, req, res, next)` and goes last; use an
  `asyncHandler` wrapper for async routes in Express 4.
- Add a 404 catch-all after all routes.

Next up: **URL handling** — parsing, building, and working with URLs and query strings.
