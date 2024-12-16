import fs from 'fs';

async function derivePackageRoot(resolved) {
  // can't rely on the specifier, for example in monorepos
  // where @foo/bar may point to a non node_modules location
  // e.g. packages/some-namespace/package.json
  // so we walk backwards looking for nearest package.json
  const segments = resolved
    .replace('file://', '')
    .split('/')
    .filter(segment => segment !== '')
    .reverse();
  let root = resolved.replace(segments[0], '');

  for (const segment of segments.slice(1)) {
    if (fs.existsSync(new URL('./package.json', root))) {
      // now we have to check that this package.json actually has
      // - name AND version
      // - main or module or exports
      const resolvedPackageJson = (await import(new URL('./package.json', root), { with: { type: 'json' } })).default;
      const { name, version, main, module, exports } = resolvedPackageJson;

      if ((name && version) && (main || module || exports)) {
        break;
      }
    }

    root = root.replace(`${segment}/`, '');
  }

  return root;
}

const SPECIFIER = 'luxon';

const resolved = import.meta.resolve(SPECIFIER);
const root = await derivePackageRoot(resolved);

console.log({ resolved, root });