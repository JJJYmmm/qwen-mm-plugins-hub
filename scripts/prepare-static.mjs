import {
  readFile,
  copyFile,
  mkdir,
  writeFile,
  access,
  cp,
} from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist/client');
const { plugins } = JSON.parse(await readFile('data/catalog.json', 'utf8'));
// Vinext's trailingSlash export currently redirects its internal RSC requests.
// Export without redirects, then provide directory indexes for portable URLs.
for (const { id } of plugins) {
  const destination = path.join(root, 'plugins', id);
  await mkdir(destination, { recursive: true });
  await copyFile(
    path.join(root, 'plugins', `${id}.html`),
    path.join(destination, 'index.html'),
  );
}
await writeFile(path.join(root, '.nojekyll'), '');
// Fail publication if a page references an asset outside the exported tree.
const prefix = process.env.SITE_BASE_PATH || '';
if (prefix) {
  if (!/^\/[a-zA-Z0-9_-]+$/.test(prefix))
    throw new Error('SITE_BASE_PATH must be a single safe path segment');
  // assetPrefix also nests Vinext's emitted assets. Pages supplies the prefix
  // itself, so put a copy at the artifact root while preserving URL references.
  await cp(
    path.join(root, prefix.slice(1), '_next'),
    path.join(root, '_next'),
    { recursive: true },
  );
}
for (const file of [
  'index.html',
  ...plugins.map((p) => `plugins/${p.id}/index.html`),
]) {
  const html = await readFile(path.join(root, file), 'utf8');
  if (html.includes('id="__next_error__"'))
    throw new Error(`Error page exported: ${file}`);
  for (const [, url] of html.matchAll(
    /(?:src|href)="([^"?#]+\.(?:js|css|woff2))"/g,
  )) {
    if (!url.startsWith('/')) continue;
    if (prefix && !url.startsWith(prefix + '/'))
      throw new Error(`Missing base path in ${file}: ${url}`);
    await access(path.join(root, url.slice(prefix.length).replace(/^\//, '')));
  }
}
console.log(
  `Verified ${plugins.length + 1} static pages and their script, style, and font assets.`,
);
