---
title:"Node.js URL and Query String Handling"
create:2026-10-04
update:2026-10-04
category:nodejs
tags:[nodejs,url,querystring]
summary:"Parse, build, and manipulate URLs in Node.js — the WHATWG URL class, searchParams, url.format/resolve, the legacy querystring module, and safe decoding."
top:1
copyright:true
---

# Node.js URL and Query String Handling

URLs are everywhere in a Node web app: incoming requests, outgoing fetches, redirects,
routing. The built-in `url` module (plus the global `URL` class) gives you reliable,
cross-platform tools to parse and build them — without fragile string splitting.

---

## The URL Class (recommended)

The `URL` class follows the WHATWG standard, is available globally, and auto-normalizes URLs.

```javascript
const url = new URL('https://example.com:8080/api/users?page=2&sort=name#section');

url.protocol;   // 'https:'
url.hostname;   // 'example.com'
url.port;       // '8080'
url.pathname;   // '/api/users'
url.search;     // '?page=2&sort=name'
url.hash;       // '#section'
url.origin;     // 'https://example.com:8080'
```

---

## Query Parameters with searchParams

`searchParams` is a `URLSearchParams` object with helpful methods:

```javascript
const url = new URL('https://example.com/search?q=node&page=2');

url.searchParams.get('q');       // 'node'
url.searchParams.get('page');    // '2'
url.searchParams.get('missing'); // null

url.searchParams.has('q');                    // true
url.searchParams.getAll('tag');               // ['a','b'] if repeated
[...url.searchParams.entries()];              // [['q','node'],['page','2']]

// Modify
url.searchParams.set('q', 'nodejs');
url.searchParams.append('limit', '10');
url.searchParams.delete('page');
url.search; // '?q=nodejs&limit=10' (update url.toString() to see it)
```

> `searchParams.get` always returns a **string** (or `null`). Coerce numbers yourself:
> `const page = Number(url.searchParams.get('page') || 1)`.

---

## Building URLs

```javascript
const url = new URL('https://example.com/api');
url.pathname = '/api/v2/users';
url.searchParams.set('page', '1');
url.hash = 'top';

console.log(url.toString());
// https://example.com/api/v2/users?page=1#top
```

Use a base for relative paths (very handy in a server):

```javascript
// Given only req.url like '/api/users?page=2'
const url = new URL(req.url, `http://${req.headers.host}`);
url.pathname;               // '/api/users'
url.searchParams.get('page'); // '2'
```

---

## URLSearchParams Without a Full URL

```javascript
const params = new URLSearchParams('page=2&sort=name');

params.get('page');    // '2'
params.set('page', '3');
params.toString();     // 'page=3&sort=name'
```

---

## url.format and url.resolve (legacy)

The `url` module's older helpers are still handy for templates:

```javascript
const url = require('url');

url.format({
  protocol: 'https',
  hostname: 'example.com',
  pathname: '/api',
  query: { page: 2 }, // auto-serialized to ?page=2
});
// 'https://example.com/api?page=2'

url.resolve('https://example.com/a/b', '../c');
// 'https://example.com/c'  (resolve a relative reference)
```

---

## The querystring Module (legacy)

`querystring` is the older, callback-style module. Most modern code uses `searchParams`
instead, but you'll still meet it in existing code.

```javascript
const querystring = require('querystring');

// Parse
const qs = querystring.parse('name=Ada&role=engineer');
qs.name; // 'Ada'

// Escape / unescape
querystring.escape('a b&c');       // 'a%20b%26c'
querystring.unescape('a%20b%26c'); // 'a b&c'
```

---

## Decoding and Encoding Safely

```javascript
decodeURIComponent('a%20b');      // 'a b'
encodeURIComponent('a b&c');      // 'a%20b%26c'
encodeURI('https://x.com/a b');   // 'https://x.com/a%20b'  (keeps :// intact)
```

**Rule of thumb:** use `encodeURIComponent` for **individual values** (a query param, a path
segment). Use `encodeURI` only for a whole URL where you want the scheme/host untouched.

This prevents injection bugs and handles non-ASCII / spaces correctly.

---

## Routing Example with the URL Class

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  if (pathname === '/api/search' && req.method === 'GET') {
    const q = url.searchParams.get('q') || '';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ query: q }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(3000);
```

In Express you get the parsed pieces directly (`req.path`, `req.query`), so you rarely need
this manually — but it's the right tool for scripts, proxies, and any non-framework HTTP code.

---

## Key Takeaways

- Use the global `URL` class to parse URLs; it normalizes and never throws on valid input.
- `url.searchParams` gets/sets query values (`.get`, `.set`, `.append`, `.delete`); values are strings.
- `new URL(req.url, 'http://' + req.headers.host)` turns a request path into a full URL in a server.
- `encodeURIComponent` for individual values, `encodeURI` only for whole URLs.
- `url.format`, `url.resolve`, and `querystring` are legacy but still appear in older code.
- Express exposes `req.path` / `req.query` so you rarely parse manually there.

Next up: build a full REST API that ties modules, fs, routing, and middleware together.
