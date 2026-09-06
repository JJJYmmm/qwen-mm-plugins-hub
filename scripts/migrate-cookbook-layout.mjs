// One-time mechanical migration of the verified import; keep staging as a recovery copy.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const staging = path.resolve('public/cookbook-assets');
const books = JSON.parse(fs.readFileSync('data/cookbooks.json', 'utf8'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const imageCases = {
  'blender-desk-lamp': 'case-blender-cc-desk-lamp',
  'blender-codex-terrarium': 'case-blender-codex-terrarium',
  blender: 'installation',
  'freecad-bracket-iso': 'case-freecad-cc-bracket',
  'freecad-codex-dovetail-quick-release':
    'case-freecad-codex-dovetail-quick-release',
  freecad: 'installation',
  'cc-basic-use': 'case-core-cc-basic-use',
  'codex-api-use': 'case-core-codex-api-use',
  'qwenwork-install': 'installation',
};
const mappings = new Map();
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    );
}
for (const file of walk(staging)) {
  const relative = path.relative(staging, file),
    cap = relative.split('/')[0];
  const stem = path.basename(file, path.extname(file)),
    isHtml = file.endsWith('.html');
  const caseId =
    stem === 'video-memory-demo-html'
      ? 'video-memory-demo'
      : imageCases[stem] || stem;
  const destination = `cases/${cap}/${caseId}/${isHtml ? 'index.html' : 'assert/' + path.basename(file)}`;
  mappings.set(relative, destination);
  const target = path.join('public', destination);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (!isHtml) {
    fs.copyFileSync(file, target);
    continue;
  }
  const html = fs
    .readFileSync(file, 'utf8')
    .replace(
      /data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=\r\n]+)/g,
      (_, type, encoded) => {
        const bytes = Buffer.from(encoded, 'base64');
        const name = `image-${hash(bytes).slice(0, 16)}.${type === 'jpeg' ? 'jpg' : type}`;
        const asset = path.join(path.dirname(target), 'assert', name);
        fs.mkdirSync(path.dirname(asset), { recursive: true });
        fs.writeFileSync(asset, bytes);
        return 'assert/' + name;
      },
    );
  fs.writeFileSync(target, html);
}
for (const [id, book] of Object.entries(books)) {
  let markdown = book.markdown;
  for (const [old, destination] of mappings) {
    const replacement = '../../../public/' + destination;
    markdown = markdown.replaceAll('/cookbook-assets/' + old, replacement);
    const relative = path.posix.relative(id, old);
    markdown = markdown
      .replaceAll('](' + relative + ')', '](' + replacement + ')')
      .replaceAll('src="' + relative + '"', 'src="' + replacement + '"')
      .replaceAll('href="' + relative + '"', 'href="' + replacement + '"');
  }
  const target = `content/cookbooks/${id}/usage.md`;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, markdown);
}
const imported = JSON.parse(fs.readFileSync('cookbook-media.json', 'utf8'));
for (const item of Object.values(imported)) {
  item.path = mappings.get(item.path);
  item.sourceSha256 = item.sha256;
  item.sourceBytes = item.bytes;
  const bytes = fs.readFileSync(path.join('public', item.path));
  item.sha256 = hash(bytes);
  item.bytes = bytes.length;
}
fs.writeFileSync(
  'cookbook-media.json',
  JSON.stringify(imported, null, 2) + '\n',
);
fs.mkdirSync('.sources', { recursive: true });
if (fs.existsSync('.sources/cookbook-import-backup'))
  throw Error('Backup already exists');
fs.renameSync(staging, '.sources/cookbook-import-backup');
console.log(
  `Migrated ${Object.keys(books).length} cookbooks and ${mappings.size} media files; extracted embedded case images into assert/`,
);
