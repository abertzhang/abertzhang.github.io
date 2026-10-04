---
title:"Express.js Getting Started"
create:2026-10-04
update:2026-10-04
category:nodejs
tags:[nodejs,express,web]
summary:"Build web apps with Express — installation, a minimal app, the request and response objects, response helpers, serving static files, JSON body parsing, and a small REST API."
top:1
copyright:true
---

# Express.js Getting Started

**Express** is the most popular web framework for Node.js. It sits on top of the built-in
`http` module and removes the boilerplate: routing, request parsing, static file serving, and
middleware all become a few lines instead of manual stream handling.

Express does not change how Node works — it's just a layer over `http`. Once you learn Express
you still understand what happens underneath.

---

## Install Express

Create a project and add Express:

```bash
mkdir my-express-app
cd my-express-app
npm init -y
npm install express
```

This creates `node_modules/express` and adds it to `dependencies` in `package.json`.

---

## A Minimal App

Create `app.js`:

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
```

Run it:

```bash
node app.js
# or add a script: "start": "node app.js", then run `npm start`
```

Visit `http://localhost:3000` and you'll see `Hello, World!`.

---

## Understanding req and res

Express extends the native Node request/response with helpers, so everything from the `http`
module still works.

**Request (`req`) — things you can read:**

```javascript
req.method;     // 'GET', 'POST', ...
req.path;       // '/users/42'  (path without query string)
req.query;      // { page: '2' } (from ?page=2)
req.params;     // { id: '42' } (from /users/:id)
req.headers;    // request headers
req.body;       // parsed body (needs express.json/urlencoded middleware)
req.ip;         // client IP
```

**Response (`res`) — helpers to reply:**

```javascript
res.send('text or object');   // auto-sets Content-Type
res.json({ ok: true });       // sends JSON
res.status(201).send(obj);    // chain a status code
res.sendFile('./public/logo.png'); // send a file
res.redirect('/login');       // 302 redirect
res.set('X-Custom', 'value'); // set a header
res.end();                    // finish without a body
res.cookie('name', 'value');  // set a cookie
```

---

## Routes and Methods

```javascript
app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Ada' }]);
});

app.post('/users', (req, res) => {
  const { name } = req.body;      // requires body parsing (below)
  res.status(201).json({ id: 2, name });
});

app.put('/users/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/users/:id', (req, res) => {
  res.status(204).send();
});
```

Route params (`:id`) are available via `req.params.id`.

---

## Parsing Request Bodies

Body parsers are middleware you register with `app.use`:

```javascript
const express = require('express');
const app = express();

// Parse JSON bodies  (Content-Type: application/json)
app.use(express.json());

// Parse form-encoded bodies (from HTML forms)
app.use(express.urlencoded({ extended: true }));

app.post('/login', (req, res) => {
  // req.body = { username: '...', password: '...' }
  res.json({ received: req.body });
});
```

Without `express.json()`, `req.body` is `undefined` for JSON POSTs.

---

## Serving Static Files

```javascript
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
```

Now anything inside `public/` is served from the site root:
`public/index.html` → `http://localhost:3000/`,
`public/css/style.css` → `http://localhost:3000/css/style.css`.

---

## Middleware (the core concept)

Middleware is a function `(req, res, next)` that runs for a request. Calling `next()` passes
control to the next handler; omitting it stops the chain.

```javascript
// Log every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // continue
});

// A middleware that requires a header
function requireApiKey(req, res, next) {
  if (req.headers['x-api-key'] === 'secret') {
    next(); // authorized — continue
  } else {
    res.status(401).json({ error: 'Unauthorized' });
    // no next() — response ends here
  }
}

app.get('/secret', requireApiKey, (req, res) => {
  res.json({ secret: 'data' });
});
```

Middleware registered with `app.use` runs in order for **every** matching request; middleware
attached to a route runs only for that route. (More in the routing note.)

---

## A Small REST API

```javascript
const express = require('express');
const app = express();

app.use(express.json());

let users = [{ id: 1, name: 'Ada' }];
let nextId = 2;

// GET all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// GET one user
app.get('/api/users/:id', (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

// CREATE a user
app.post('/api/users', (req, res) => {
  const user = { id: nextId++, name: req.body.name };
  users.push(user);
  res.status(201).json(user);
});

// 404 catch-all (must be registered last)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(3000, () => console.log('API on http://localhost:3000'));
```

---

## Project Structure

A real Express app is usually split into small modules:

```
my-express-app/
├── server.js          # entry: creates app, starts listening
├── app.js             # express app + middleware + routes
├── routes/
│   └── users.js       # router for /api/users
├── controllers/
│   └── users.js       # request handling logic
├── models/            # data access
├── middleware/        # custom middleware
├── public/            # static files
└── views/             # templates
```

This keeps files focused and makes the app easy to test and extend.

---

## Key Takeaways

- Install with `npm install express`; create an app with `express()` and `app.listen(port)`.
- `req` gives `method`, `path`, `query`, `params`, `headers`, `body`; `res` gives
  `send`, `json`, `status`, `sendFile`, `redirect`.
- Register `express.json()` (and `urlencoded`) to parse request bodies.
- Middleware are `(req, res, next)` functions; call `next()` to continue the chain.
- `express.static('public')` serves a folder of static assets.
- Put the 404 handler last; keep the entry point (`server.js`) separate from app setup.

Next up: **Express routing and middleware in depth** — routers, params, query, and error handling.
