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
const { plugins, contributors } = JSON.parse(
  await readFile('data/catalog.json', 'utf8'),
);
const cookbooks = JSON.parse(await readFile('data/cookbooks.json', 'utf8'));
// Vinext's trailingSlash export currently redirects its internal RSC requests.
// Export without redirects, then provide directory indexes for portable URLs.
for (const { id } of plugins) {
  const destination = path.join(root, 'plugins', id);
  await mkdir(destination, { recursive: true });
  await copyFile(
    path.join(root, 'plugins', `${id}.html`),
    path.join(destination, 'index.html'),
  );
  await mkdir(path.join(destination, 'cookbook'), { recursive: true });
  await copyFile(
    path.join(destination, 'cookbook.html'),
    path.join(destination, 'cookbook/index.html'),
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
  ...plugins.map((p) => `plugins/${p.id}/cookbook/index.html`),
]) {
  const html = await readFile(path.join(root, file), 'utf8');
  if (html.includes('id="__next_error__"'))
    throw new Error(`Error page exported: ${file}`);
  if (!html.includes(`action="${prefix}/"`))
    throw new Error(`Documentation search has the wrong destination: ${file}`);
  if (
    !html.includes('class="brand-mark"') ||
    !html.includes(`src="${prefix}/favicon.svg"`)
  )
    throw new Error(
      `Qwen brand asset missing or incorrectly prefixed: ${file}`,
    );
  if (file.startsWith('plugins/')) {
    if (
      !html.includes('aria-label="Plugin documentation"') ||
      !html.includes('aria-label="On this page"')
    )
      throw new Error(`Documentation navigation missing: ${file}`);
    for (const plugin of plugins) {
      if (!html.includes(`href="${prefix}/plugins/${plugin.id}/"`))
        throw new Error(
          `Plugin navigation link missing in ${file}: ${plugin.id}`,
        );
    }
    if (file.includes('/cookbook/')) {
      if (!html.includes('id="cookbook-content"'))
        throw new Error(`Cookbook content missing: ${file}`);
      for (const [, url] of html.matchAll(
        /(?:src|href)="([^"?#]*\/cases\/[^"?#]+)"/g,
      )) {
        if (!url.startsWith(prefix + '/cases/'))
          throw new Error(`Wrong cookbook asset prefix: ${url}`);
        await access(path.join(root, url.slice(prefix.length)));
      }
      for (const [, href] of html.matchAll(/href="([^"]*#[^"]+)"/g)) {
        const url = new URL(href, `https://hub.local/${file}`);
        if (url.origin !== 'https://hub.local') continue;
        // Overview tabs are mounted on demand by PluginDetail's hash handler.
        // Their targets are absent from prerendered HTML until that tab opens.
        if (
          plugins.some((p) => url.pathname === `${prefix}/plugins/${p.id}/`) &&
          ['#tools', '#install'].includes(url.hash)
        )
          continue;
        const destination =
          url.pathname === `/${file}`
            ? html
            : await readFile(
                path.join(
                  root,
                  url.pathname.slice(prefix.length),
                  'index.html',
                ),
                'utf8',
              );
        if (
          !destination.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)
        )
          throw new Error(`Broken cookbook anchor in ${file}: ${href}`);
      }
      const id = file.split('/')[1];
      const expectedMedia = [
        ...cookbooks[id].markdown.matchAll(
          /\]\(([^)]+\/public\/cases\/[^)]+\.(?:mp4|webm|html))\)/g,
        ),
      ];
      for (const [, media] of expectedMedia) {
        const src =
          prefix +
          media.slice(media.indexOf('/public/cases/') + '/public'.length);
        const tag = media.endsWith('.html') ? 'iframe' : 'video';
        const embed = [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))]
          .map((match) => match[0])
          .find((element) => element.includes(`src="${src}"`));
        if (
          !embed ||
          (tag === 'iframe' && !embed.includes('sandbox="allow-scripts"'))
        )
          throw new Error(
            `Missing or unsafe cookbook preview in ${file}: ${src}`,
          );
      }
    } else {
      if (!html.includes('id="skill"'))
        throw new Error(`Skill permalink target missing: ${file}`);
      const current = plugins.find(
        (p) => file === `plugins/${p.id}/index.html`,
      );
      for (const id of current.contributors) {
        if (!html.includes(`href="${contributors[id].url}"`))
          throw new Error(`Contributor profile missing in ${file}: ${id}`);
      }
      if (
        !html.includes('id="tokens"') ||
        !html.includes('data-token-kind="skill"') ||
        !html.includes('data-token-kind="tools"') ||
        !html.includes(
          current.tokenEstimate.skillFull.toLocaleString('en-US'),
        ) ||
        !html.includes(current.tokenEstimate.toolsTotal.toLocaleString('en-US'))
      )
        throw new Error(`Token estimates missing or incorrect: ${file}`);
      const cookbookButton = html.match(
        /<a\b[^>]*class="cookbook-button"[^>]*>/,
      )?.[0];
      if (!cookbookButton?.includes(`href="${prefix}${current.cookbookUrl}"`))
        throw new Error(
          `Prominent Cookbook link missing or incorrect: ${file}`,
        );
    }
  } else {
    for (const plugin of plugins) {
      if (!html.includes(`href="${prefix}/plugins/${plugin.id}/#tokens"`))
        throw new Error(`Token estimate card link missing: ${plugin.id}`);
    }
    for (const contributor of Object.values(contributors)) {
      if (!html.includes(`href="${contributor.url}"`))
        throw new Error(
          `Contributor profile missing from catalog: ${contributor.name}`,
        );
    }
  }
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
  `Verified ${plugins.length * 2 + 1} static pages, documentation navigation, cookbook media, token estimates, search destinations, and script, style, and font assets.`,
);
