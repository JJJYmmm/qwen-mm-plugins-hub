'use client';

import { useState, useEffect } from 'react';
import Link from '@/components/static-link';
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Braces,
  Layers3,
  X,
  Users,
  Check,
  Sparkles,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { SiteHeader, SiteFooter } from '@/components/site-header';
import { PluginIcon } from '@/components/plugin-icon';
import {
  filterPlugins,
  formatTokens,
  type PluginSummary,
  type Contributor,
} from '@/lib/catalog';

export function Catalog({
  plugins,
  contributors,
  categories,
  tokenizerLabel,
}: {
  plugins: PluginSummary[];
  contributors: Record<string, Contributor>;
  categories: string[];
  tokenizerLabel: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [contributor, setContributor] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [sort, setSort] = useState('default');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get('q') || '');
      setCategory(params.get('category') || '');
      setContributor(params.get('contributor') || '');
      setTags(params.getAll('tag'));
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (contributor) params.set('contributor', contributor);
    tags.forEach((t) => params.append('tag', t));
    window.history.replaceState(
      null,
      '',
      window.location.pathname + (params.size ? '?' + params : ''),
    );
  }, [query, category, contributor, tags, ready]);
  const filtered = filterPlugins(
    plugins,
    query,
    category,
    contributor,
    tags,
  ).sort((a, b) =>
    sort === 'name'
      ? a.title.localeCompare(b.title)
      : sort === 'tools'
        ? b.toolCount - a.toolCount
        : a.order - b.order,
  );
  const allTags = [...new Set(plugins.flatMap((p) => p.tags))].sort();
  const totalTools = plugins.reduce((n, p) => n + p.toolCount, 0);
  const active = Boolean(query || category || contributor || tags.length);
  function reset() {
    setQuery('');
    setCategory('');
    setContributor('');
    setTags([]);
  }
  function toggleTag(t: string) {
    setTags((current) =>
      current.includes(t) ? current.filter((x) => x !== t) : [...current, t],
    );
  }
  return (
    <>
      <a className="skip-link" href="#plugins">
        Skip to plugins
      </a>
      <SiteHeader />
      <main className="catalog-shell">
        <div className="catalog-layout">
          <aside
            className={`filter-sidebar ${filtersOpen ? 'is-open' : ''}`}
            aria-label="Filter plugins"
          >
            <div className="filter-heading">
              <span>
                <SlidersHorizontal size={16} />
                Filters
              </span>
              {active && <button onClick={reset}>Reset</button>}
            </div>
            <section className="filter-section">
              <h2>Capabilities</h2>
              <button
                onClick={() => setCategory('')}
                className={`category-option ${!category ? 'selected' : ''}`}
              >
                <span>
                  <Layers3 size={15} />
                  All plugins
                </span>
                <small>{plugins.length}</small>
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c === category ? '' : c)}
                  className={`category-option ${category === c ? 'selected' : ''}`}
                >
                  <span>{c}</span>
                  <small>
                    {plugins.filter((p) => p.category === c).length}
                  </small>
                </button>
              ))}
            </section>
            <section className="filter-section">
              <h2>
                <Users size={15} />
                Contributors
              </h2>
              {Object.entries(contributors).map(([id, c]) => (
                <label className="contributor-option" key={id}>
                  <Checkbox
                    checked={contributor === id}
                    onCheckedChange={(checked) =>
                      setContributor(checked ? id : '')
                    }
                    aria-label={c.name}
                  />
                  <span className="mini-avatar">Q</span>
                  <span>{c.name}</span>
                  <span className="verified" aria-label="Verified source">
                    <Check size={11} />
                  </span>
                  <small>
                    {plugins.filter((p) => p.contributors.includes(id)).length}
                  </small>
                </label>
              ))}
            </section>
            <section className="filter-section">
              <h2>Tags</h2>
              <div className="filter-tags">
                {allTags.map((t) => (
                  <button
                    key={t}
                    className={`tag ${tags.includes(t) ? 'tag-active' : ''}`}
                    onClick={() => toggleTag(t)}
                    aria-pressed={tags.includes(t)}
                  >
                    {t}
                    {tags.includes(t) && <X size={11} />}
                  </button>
                ))}
              </div>
            </section>
            <a
              className="contribute-note"
              href="https://github.com/QwenLM/Qwen-MM-Plugins/blob/main/CONTRIBUTING.md"
            >
              <Sparkles size={17} />
              <strong>Build something useful.</strong>
              <span>Add your capability to the toolkit.</span>
              <span className="purple-text">
                Contribute a plugin <ArrowUpRight size={14} />
              </span>
            </a>
          </aside>
          <section
            id="plugins"
            className="plugin-results"
            aria-label="Plugin directory"
          >
            <div className="directory-toolbar">
              <div className="search-field">
                <Search size={18} />
                <input
                  aria-label="Search plugins and tools"
                  placeholder="Search plugins, capabilities, or tools…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    aria-label="Clear search"
                    onClick={() => setQuery('')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                className="mobile-filter-button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-expanded={filtersOpen}
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>
            </div>
            <div className="results-heading">
              <div>
                <h1>
                  Plugins <span>{filtered.length}</span>
                </h1>
                <p>
                  {active
                    ? 'Matching your filters'
                    : `Skills and ${totalTools} MCP tools from Qwen Team`}
                </p>
              </div>
              <Select
                value={sort}
                onValueChange={(value) => setSort(value || 'default')}
              >
                <SelectTrigger
                  aria-label="Sort plugins"
                  className="sort-select"
                >
                  <SelectValue>
                    {sort === 'tools'
                      ? 'Most tools'
                      : sort === 'name'
                        ? 'Name: A–Z'
                        : 'Default order'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default order</SelectItem>
                  <SelectItem value="name">Name: A–Z</SelectItem>
                  <SelectItem value="tools">Most tools</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {active && (
              <div className="active-filters">
                {category && (
                  <button onClick={() => setCategory('')}>
                    {category}
                    <X size={12} />
                  </button>
                )}
                {contributor && (
                  <button onClick={() => setContributor('')}>
                    {contributors[contributor]?.name || contributor}
                    <X size={12} />
                  </button>
                )}
                {tags.map((t) => (
                  <button key={t} onClick={() => toggleTag(t)}>
                    {t}
                    <X size={12} />
                  </button>
                ))}
                <button className="clear-all" onClick={reset}>
                  Clear all
                </button>
              </div>
            )}
            <div aria-live="polite" className="sr-only">
              {filtered.length} plugins found
            </div>
            <div className="plugin-grid">
              {filtered.map((p) => (
                <article key={p.id} className="plugin-card">
                  <div className="card-top">
                    <PluginIcon icon={p.icon} color={p.color} />
                    <span className="category-label">{p.category}</span>
                    {p.channel === 'Development' && (
                      <span className="dev-badge">Dev</span>
                    )}
                  </div>
                  <Link href={`/plugins/${p.id}/`} className="card-title">
                    <h3>
                      <span className="namespace">Qwen / </span>
                      {p.id}
                    </h3>
                    <ArrowUpRight size={19} />
                  </Link>
                  <div className="card-byline">
                    {p.contributors.map((c) => (
                      <button key={c} onClick={() => setContributor(c)}>
                        {contributors[c]?.name || c}
                      </button>
                    ))}
                    <span>·</span>
                    <span title="Manifest version in the documented main snapshot">
                      main · v{p.version}
                    </span>
                  </div>
                  <p className="card-description">
                    {p.description.replace(/^Qwen-MM-Plugins\s+[^—]+—\s*/i, '')}
                  </p>
                  <div className="card-tags">
                    {p.tags.map((t) => (
                      <button
                        className="tag"
                        key={t}
                        onClick={() => toggleTag(t)}
                        aria-pressed={tags.includes(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <Link
                    className="card-token-estimate"
                    href={`/plugins/${p.id}/#tokens`}
                    title={`Estimated content tokens, using the ${tokenizerLabel} tokenizer. Excludes client wrappers and runtime content.`}
                  >
                    <span>
                      Skill ≈ {formatTokens(p.tokenEstimate.skillFull)}
                    </span>
                    <span>
                      Tools ≈ {formatTokens(p.tokenEstimate.toolsTotal)}
                    </span>
                    <span className="token-model-label">
                      {tokenizerLabel} tokens
                    </span>
                  </Link>
                  <div className="card-bottom">
                    <Link
                      className="card-content-link"
                      href={`/plugins/${p.id}/#skill`}
                    >
                      <BookOpen size={14} />1 Skill
                    </Link>
                    <Link
                      className="card-content-link"
                      href={`/plugins/${p.id}/#tools`}
                    >
                      <Braces size={14} />
                      {p.toolCount ? `${p.toolCount} tools` : 'Skill only'}
                    </Link>
                    <Link
                      href={`/plugins/${p.id}/`}
                      aria-label={`Explore ${p.title}`}
                    >
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            {!filtered.length && (
              <div className="empty-state">
                <Search size={30} />
                <h3>No plugins found</h3>
                <p>Try a different term or remove a filter.</p>
                <button onClick={reset}>Clear filters</button>
              </div>
            )}
            <div className="directory-end">
              <span className="live-dot" />
              <span>Skills and tool definitions, directly from source.</span>
              <a href="https://github.com/QwenLM/Qwen-MM-Plugins">
                Explore the repository <ArrowUpRight size={13} />
              </a>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
