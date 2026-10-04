---
title:"Node.js: Building a Simple App from Scratch"
create:2026-10-04
update:2026-10-04
category:nodejs
tags:[nodejs,http,server]
summary:"A hands-on walkthrough of building your first Node.js application — project setup, a raw HTTP server with the built-in http module, and simple routing — based on the Runoob Node.js tutorial."
top:1
copyright:true
---

# Node.js: Building a Simple App from Scratch

This note walks through the canonical "hello world" of backend development: standing up a
bare HTTP server with Node.js and no frameworks. It is adapted from the
[Runoob Node.js tutorial](https://www.runoob.com/nodejs/nodejs-build-app.html) and written
as a self-contained study reference. When you finish, you will have a project that listens on
a port, returns HTML, and serves different content for different routes.

The steps are:

- Install Node.js and npm
- Create a project folder
- Initialize the project (`package.json`)
- Create the entry file
- Write a simple HTTP server
- Run and access the server
- Add basic routing

---

## 1. Prerequisites — Install Node.js

Make sure Node.js and its package manager npm are available on your machine. Verify the
versions from a terminal:

```bash
node -v
npm -v
```

If either command is missing, follow the
[Node.js install guide](https://www.runoob.com/nodejs/nodejs-install-setup.html) first.
Any LTS release works for the code below.

---

## 2. Create the Project Folder

Keep each project in its own directory. Create one and move into it:

```bash
mkdir my-first-node-app
cd my-first-node-app
```

---

## 3. Initialize the Project

`npm init` generates a `package.json` that describes the project. The `-y` flag accepts all
defaults so you don't have to answer prompts:

```bash
npm init -y
```

Then edit the generated `package.json` so the entry point and a convenient start script are
explicit:

```json
{
  "name": "my-first-node-app",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {}
}
```

- `main` declares the entry file Node loads if the package is required elsewhere.
- `scripts.start` lets you launch the server with `npm start` instead of typing the full
  `node app.js` command every time.

---

## 4. Create the Entry File

Create `app.js` at the project root. This is the file Node runs; it will hold both the server
setup and the request/response logic.

---

## 5. Write the HTTP Server

Node ships a built-in `http` module, so no external dependency is needed for a basic server.
The `require` call pulls it in, and `http.createServer` hands you a callback that runs on
every incoming request.

```javascript
const http = require('http');

// Create the server; the callback receives (req, res) for each request.
const server = http.createServer((req, res) => {
  // Status 200 + UTF-8 HTML header so non-ASCII text renders correctly.
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
  });

  // Send the response body and close the stream.
  res.end('<h1>Hello, World!</h1><p>This is my first Node.js app.</p>');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

Key points:

- `require('http')` is CommonJS module loading — the classic Node.js module system.
- `req` (request) carries the incoming data; `res` (response) is what you write back.
- `res.writeHead(statusCode, headers)` sets the HTTP status and response headers.
- `res.end(body)` sends the body and signals the response is complete — you must call it
  exactly once per request.
- `server.listen(PORT, callback)` binds to the port and the callback fires once listening.

> Note: This example uses CommonJS (`require`). Modern Node.js also supports ES Modules via
> `import` when `"type": "module"` is set in `package.json`, but `require` keeps the snippet
> framework-free and matches the original tutorial.

---

## 6. Run the Server

From the project root, start it with the script defined earlier:

```bash
npm start
```

The terminal prints:

```text
Server is running on http://localhost:3000
```

---

## 7. Access the Server

Open a browser (or `curl http://localhost:3000`) and visit `http://localhost:3000`. You
should see the rendered "Hello, World!" heading — proof that the server is alive and
returning HTML.

---

## 8. Add Simple Routing

A real server responds differently depending on the URL path. `req.url` exposes the path, so
you can branch on it. Anything unmatched falls through to a 404.

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Welcome to the homepage!');
  } else if (req.url === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('This is the about page.');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

Now `http://localhost:3000/` returns the homepage, `/about` returns the about page, and any
other path returns a plain-text 404. This is the conceptual seed of every router framework:
match the path, pick a handler, write a response.

---

## Where to Go Next

You now have a working, dependency-free Node.js HTTP app. Natural extensions:

- **Add a database** (e.g. SQLite or Postgres) so responses are data-driven.
- **Adopt Express** to replace the hand-rolled `if/else` routing with declarative routes,
  middleware, and static file serving.
- **Parse request bodies** for POST endpoints (raw `http` gives you a stream you must buffer
  and parse yourself; Express/frameworks do this for you).
- **Serve real HTML/CSS** by reading template files with the `fs` module instead of inline
  strings.

The raw `http` server is the foundation every Node.js web framework is built on — understanding
it makes the higher-level tools far less mysterious.
