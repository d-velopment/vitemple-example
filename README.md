# Vitemple Examples

[![Vitemple](https://img.shields.io/badge/Vitemple-0.1.5-2563eb?style=flat-square)](https://github.com/d-velopment/vitemple)
[![TypeScript](https://img.shields.io/badge/TypeScript-first-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-powered-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Native DOM](https://img.shields.io/badge/rendering-native%20DOM-0f766e?style=flat-square)](https://github.com/d-velopment/vitemple)

A small, runnable showcase for [Vitemple](https://github.com/d-velopment/vitemple), a TypeScript-first HTML component preprocessor that targets native DOM APIs. The `basic` example demonstrates recursive HTML slots, scoped CSS, TypeScript scripts, reusable templates, and shared in-box reactivity through `store`.

Online demo: https://d-velopment.github.io/vitemple-example/

## Quick start

```sh
git clone https://github.com/d-velopment/vitemple-example.git
cd vitemple-example/basic
npm install
npm run dev
```

Open the URL printed by Vite, usually [http://localhost:5173](http://localhost:5173). Changes in `src` trigger a rebuild and a full browser reload.

## Commands

Run these commands from `basic`:

```sh
npm run build   # compile src/index.html into dist/index.html
npm run dev     # Vite development server with rebuild and browser reload
npm start       # serve dist with Vite Preview
```

The generated `dist` directory is ignored by Git and can be recreated at any time.

## What the example demonstrates

- Two instances of the same `card.html` component with different attributes and isolated scripts.
- Attribute interpolation such as `{id}` and `{test}` in imported HTML and scripts.
- Scoped component styles collected once in the document `<head>`.
- TypeScript scripts transpiled and bundled into the generated HTML.
- A reusable `type="template"` component cloned ten times at runtime.
- A shared `store` counter controlled by `+` and `−` buttons.
- Runtime page selection stored in `store` and reflected in the document title and selected page styling.
- A generated one-line `dist/index.html` with obfuscated JavaScript and a size approximately 20% smaller than the source used for the build.

## Component composition

The parent page imports the child component and external assets with slots:

```html
<slot src="./components/card.html" id="card1" test="Hello, world!" />
<slot src="./style.css" type="css" />
<slot src="./scripts.ts" type="script" />
```

Each slot attribute is available inside the imported component as a placeholder. For example, `id="card1"` replaces `{id}`. The compiler resolves these imports before the browser receives the final HTML.

## Reusable template

`reuse.html` is imported as a native template:

```html
<slot src="./components/reuse.html" type="template" id="pageNumber" />
```

The main script clones the template ten times, assigns each clone a `data-value`, and appends the fragments to the pagination container. The template script runs once after `DOMContentLoaded` and subscribes all generated pages to the shared store.

## TypeScript setup

The example depends on the published npm package:

```json
"dependencies": {
  "vitemple": "^0.1.3"
}
```

`tsconfig.json` extends `vitemple/tsconfig.json` and includes the package declaration for the global `store`, so editor and compiler support are available without a local framework copy.

## Project layout

```text
basic/
├── src/
│   ├── index.html
│   ├── scripts.ts
│   ├── style.css
│   └── components/
├── dist/          # generated output, ignored by Git
├── package.json
└── tsconfig.json
```

## Related project

- [Vitemple framework](https://github.com/d-velopment/vitemple)

