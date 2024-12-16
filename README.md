# import-meta-resolve-luxon

A reproduction repo for resolving luxon with `import.meta.resolve`

## Setup

1. Clone the repo
1. Install NodeJS (or run `nvm use`)

## Demo

By running `npm run build` you will see the output of `import.meta.resolve`.  In a prior version, the logic was simply this:

```js
for (const segment of segments.slice(1)) {
  if (fs.existsSync(new URL('./package.json', root))) {
    break;
  }
}
```

But with luxon and its nested _package.json_, we don't get to the root.
- What we want - `file:///Users/path/to/.../node_modules/luxon/`
- What we got - `file:///Users/path/to/.../node_modules/luxon/src/`

So to better filter out this false positive, we can filter out for `name` and `version` and also ensure the package has either a `main`, `module`, or `exports` field.

```js
for (const segment of segments.slice(1)) {
  if (fs.existsSync(new URL('./package.json', root))) {
    const resolvedPackageJson = (await import(new URL('./package.json', root), { with: { type: 'json' } })).default;
    const { name, version, main, module, exports } = resolvedPackageJson;

    if ((name && version) && (main || module || exports)) {
      break;
    }
  }

  root = root.replace(`${segment}/`, '');
}
```