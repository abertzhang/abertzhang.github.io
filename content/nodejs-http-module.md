---
title:"The Node.js http Module — Server and Client"
create:2026-10-04
update:2026-10-04
category:nodejs
tags:[nodejs,http,server]
summary:"Build on Node's low-level http module — createServer, the request/response objects, status codes and headers, routing, and making outbound requests with http.get/request."
top:1
copyright:true
---

# The Node.js http Module — Server and Client

The `http` module is Node's built-in foundation for web servers and clients. Express (and
most frameworks) are built on top of it. Learning it directly shows what's really happening
under every framework.

```javascript
const http = require('http');
```

---

## Creating a Server

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  // Set the status code and response headers
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  // Send the body and finish the response
  res.end('<h1>Hello, World!</h1>');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

`createServer` takes a callback invoked for **every** request with two objects: `req`
(request) and `res` (response).

---

## The Request Object (req)

`req` is an `http.IncomingMessage` (a readable stream) carrying the incoming request:

```javascript
req.method;   // 'GET', 'POST', 'PUT', 'DELETE', ...
req.url;      // '/about?page=2'  (path + query string)
req.headers;  // { 'host': ..., 'user-agent': ..., ... }
```

Read a query parameter:

```javascript
const url = new URL(req.url, 'http://localhost');
const page = url.searchParams.get('page'); // e.g. '2'
```

Read a JSON request body (must collect the stream first):

```javascript
let body = '';
req.on('data', (chunk) => { body += chunk; });
req.on('end', () => {
  try {
    const data = JSON.parse(body || '{}');
    console.log(data);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Invalid JSON' }));
  }
});
```

---

## The Response Object (res)

`res` is an `http.ServerResponse` (a writable stream). Common methods:

```javascript
res.writeHead(statusCode, headers); // set status + headers (must be before body)
res.setHeader('Content-Type', 'application/json'); // or set headers individually
res.statusCode = 201;               // set status directly
res.write(chunk);                   // write a chunk of the body
res.end(chunk);                     // write final chunk (if any) and finish
res.redirect(302, '/login');        // send a redirect
res.setTimeout(5000);               // auto-end slow requests
```

### Returning JSON (the common case)

```javascript
res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({ ok: true }));
```

### Returning a status code

```javascript
res.writeHead(404, { 'Content-Type': 'text/plain' });
res.end('404 Not Found');
```

---

## HTTP Status Codes

| Code | Meaning |
| --- | --- |
| 200 | OK — success |
| 201 | Created — resource created (POST) |
| 204 | No Content — success, empty body |
| 301 / 302 | Moved Permanently / Found — redirects |
| 400 | Bad Request — malformed input |
| 401 / 403 | Unauthorized / Forbidden — auth issues |
| 404 | Not Found |
| 500 | Internal Server Error — unhandled server bug |
| 503 | Service Unavailable — overloaded or down |

---

## Simple Routing

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const { pathname } = url;

  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Homepage');
  } else if (pathname === '/api/users' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 1, name: 'Ada' }]));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(3000);
```

This hand-rolled routing is exactly what Express formalizes — for anything beyond a toy
app, use Express (see the next notes).

---

## Consuming a Request Body (fully)

```javascript
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const body = await readBody(req);
  console.log('Received:', body);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});
```

---

## Making an HTTP Request (Client)

`http.get` / `http.request` fetch data from another server:

```javascript
const http = require('http');

http.get('http://example.com', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('status:', res.statusCode);
    console.log('body length:', data.length);
  });
}).on('error', (err) => {
  console.error('Request failed:', err.message);
});
```

For a JSON API, parse on `end`:

```javascript
http.get('https://api.example.com/data', (res) => {
  let raw = '';
  res.on('data', (c) => (raw += c));
  res.on('end', () => {
    try {
      const data = JSON.parse(raw);
      console.log(data);
    } catch (err) {
      console.error('Failed to parse JSON:', err);
    }
  });
}).on('error', console.error);
```

> For modern code, prefer the built-in `fetch()` (available since Node 18) or a library like
> `axios`; the `http` module is here to show the mechanics.

---

## Graceful Shutdown

Always close the server and track open connections so your process can exit cleanly:

```javascript
server.listen(3000, () => console.log('Listening on 3000'));

function shutdown() {
  console.log('Shutting down...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

---

## Key Takeaways

- `http.createServer((req, res) => ...)` creates a server; `server.listen(port)` binds it.
- `req` exposes `method`, `url`, `headers`, and is a readable stream for the body.
- `res.writeHead(status, headers)` + `res.end(body)` sends a response; call `end` once.
- Route by splitting `req.url` with `new URL(req.url, base)` and matching `pathname`.
- Read request bodies by listening for `data` then `end` on `req`.
- The client side is `http.get` / `http.request`; modern Node prefers `fetch()`.
- Handle SIGINT/SIGTERM to close the server gracefully.

Next up: **Express** — the pragmatic framework built on this module.
