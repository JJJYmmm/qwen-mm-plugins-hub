import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterPlugins, schemaType } from '../lib/catalog.ts';

const catalog = JSON.parse(
  readFileSync(new URL('../data/catalog.json', import.meta.url), 'utf8'),
);
const plugins = catalog.plugins.map((p) => ({
  ...p,
  toolCount: p.tools.length,
  toolNames: p.tools.map((t) => t.name),
}));

test('all records use one public upstream snapshot and have a complete Skill', () => {
  assert.equal(new Set(plugins.map((p) => p.source.commit)).size, 1);
  assert.equal(new Set(plugins.map((p) => p.id)).size, plugins.length);
  assert(!plugins.some((p) => p.id === 'example'));
  for (const p of plugins) {
    assert.equal(p.channel, 'Main');
    assert(p.skill.raw.startsWith('---\n'));
    assert(p.skill.markdown.length > 50);
    assert(p.skill.sourceUrl.includes(p.source.commit));
    assert(p.contributors.every((c) => catalog.contributors[c]));
    assert.equal(new Set(p.tools.map((t) => t.name)).size, p.tools.length);
    for (const t of p.tools) {
      assert(t.name && t.description && t.sourceUrl.includes(p.source.commit));
      assert.equal(t.inputSchema.type, 'object');
      for (const required of t.inputSchema.required || [])
        assert(Object.hasOwn(t.inputSchema.properties, required));
    }
  }
});

test('search finds tool names, ignores case, and ANDs query terms', () => {
  assert.deepEqual(
    filterPlugins(plugins, 'WEB_SEARCH', '', '', []).map((p) => p.id),
    ['search'],
  );
  assert.deepEqual(
    filterPlugins(plugins, 'web_search nonexistent', '', '', []),
    [],
  );
  assert.equal(
    filterPlugins(plugins, '   ', '', '', []).length,
    plugins.length,
  );
});

test('category, contributor and multiple tags compose as an intersection', () => {
  const result = filterPlugins(plugins, '', 'Search & memory', 'qwen-team', [
    'audio',
    'video',
  ]);
  assert.deepEqual(
    result.map((p) => p.id),
    ['omni-memory'],
  );
  assert.equal(filterPlugins(plugins, '', '', 'unknown', []).length, 0);
});

test('Skill-only capabilities are not represented as MCP servers', () => {
  const education = plugins.find((p) => p.id === 'edu-agent');
  assert.equal(education.kind, 'Skill only');
  assert.equal(education.tools.length, 0);
});

test('parameter types preserve unions and nested arrays', () => {
  assert.equal(
    schemaType({ type: 'array', items: { type: 'string' } }),
    'string[]',
  );
  assert.equal(
    schemaType({ anyOf: [{ type: 'number' }, { type: 'string' }] }),
    'number | string',
  );
  assert.equal(schemaType({ type: ['number', 'string'] }), 'number | string');
});
