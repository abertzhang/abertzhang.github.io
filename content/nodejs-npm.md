---
title:"Node.js npm and package.json"
create:2026-10-04
update:2026-10-04
category:nodejs
tags:[nodejs,npm,package]
summary:"Manage Node.js projects with npm — initializing package.json, installing and removing dependencies, dev vs regular dependencies, running scripts, using npx, and the lockfile."
top:1
copyright:true
---

# Node.js npm and package.json

**npm** (Node Package Manager) is Node's built-in tool for creating projects, installing
third-party packages, and running scripts. Every Node project is centered on a
`package.json` file, and `npm` is what reads and writes it.

This note covers creating a project, the important `package.json` fields, installing and
removing dependencies, `scripts`, `npx`, and the lockfile.

---

## Check npm

npm ships with Node.js. Verify both:

```bash
node -v
npm -v
```

---

## Creating a Project

Create a folder and generate a `package.json` inside it:

```bash
mkdir my-app
cd my-app
npm init -y
```

`npm init` walks you through questions (name, version, description, entry point, …).
`npm init -y` (or `--yes`) skips the prompts and fills in sensible defaults.

You can also set the name directly:

```bash
npm init -y --name="my-app"
```

---

## package.json: the Project Manifest

`package.json` is a JSON file describing your project. A typical one:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "A short summary of the project",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "node --watch app.js",
    "test": "node --test"
  },
  "keywords": ["nodejs", "demo"],
  "author": "Abert Zhang",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

Important fields:

- **name** — the package name (must be lowercase, no spaces).
- **version** — semantic version `major.minor.patch` (`1.0.0`).
- **description** — what the project does.
- **main** — the entry file when the package is `require`d.
- **scripts** — named commands you run with `npm run <script>`.
- **dependencies** — packages needed at **runtime**.
- **devDependencies** — packages needed only for **development** (tests, linters, build tools).
- **license** — e.g. `MIT`, `ISC`, `Apache-2.0`.
- **type** — set to `"module"` to use ES Modules for `.js` files (optional).

---

## Installing Packages

```bash
# Runtime dependency (saved to "dependencies")
npm install express

# Development-only dependency (saved to "devDependencies")
npm install --save-dev nodemon

# Install everything from package.json + lockfile (what you run on a fresh clone)
npm install

# Install an exact version
npm install express@4.18.2

# Update packages to their allowed range
npm update
```

After `npm install express`, the package is placed in `node_modules/` and listed in
`package.json` so collaborators and CI get the same setup.

The **caret** `^4.18.2` means "any 4.x.x version >= 4.18.2" (compatible updates only);
a **tilde** `~4.18.2` is even more conservative. Pinning an exact version (`4.18.2`) gives
reproducibility at the cost of missing automatic patches.

---

## Removing Packages

```bash
npm uninstall express       # removes from node_modules and package.json
npm uninstall --save-dev jest
```

`npm uninstall` is shorthand for `npm remove` / `npm rm`.

---

## Running Scripts

Scripts are shortcuts in `package.json`. Given the `"start": "node app.js"` entry above:

```bash
npm start          # runs: node app.js
npm run dev        # runs: node --watch app.js
npm test           # runs: node --test
```

`npm start` and `npm test` are special names — they work without `run`, but you can still
write `npm run start`. Any other script requires `npm run <name>`.

---

## Using npx (run without installing)

`npx` runs a package **without** adding it to your project — handy for one-off CLI tools:

```bash
npx cowsay hello
npx create-react-app my-app
npx http-server ./public
```

If the package isn't installed locally, npx downloads it temporarily and runs it.

---

## package-lock.json

`npm install` generates `package-lock.json`, which records the **exact** version of every
installed package (and its dependencies). This makes installs reproducible: everyone and CI
get the identical dependency tree. **Commit `package-lock.json` to version control** — never
delete it by hand.

---

## Global vs Local Packages

- **Local** (default) — installed into the project's `node_modules`, available via `require`
  and `npm run`. This is the right choice for application dependencies.
- **Global** (`npm install -g <pkg>`) — installed system-wide for command-line tools
  (e.g. `npm install -g nodemon`). Global packages are not tracked by your project.

Use `npx` instead of global installs when you just need to run a tool once.

---

## Publishing (optional)

To share your package publicly:

```bash
npm login
npm publish
```

The package name must be unique on the registry. Add a `"private": true` field to
`package.json` to prevent accidental publishing of an application.

---

## Key Takeaways

- `npm init -y` creates `package.json`; it is the manifest for your project.
- `npm install <pkg>` adds a runtime dependency; `--save-dev` adds a development-only one.
- `scripts` in `package.json` define `npm start` / `npm run <name>` commands.
- `npx` runs a package without installing it into the project.
- Commit `package-lock.json` for reproducible installs; prefer local installs over `-g`.
- Add `"private": true` for applications so they can't be published accidentally.

Next up: **the fs module** — reading and writing files.
