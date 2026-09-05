'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from '@/components/static-link';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Braces,
  Check,
  CodeXml,
  FileText,
  Search,
  Terminal,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { SiteHeader, SiteFooter } from '@/components/site-header';
import { PluginIcon } from '@/components/plugin-icon';
import { CopyButton } from '@/components/copy-button';
import {
  schemaType,
  type Plugin,
  type Contributor,
  type Tool,
} from '@/lib/catalog';

const installCommand =
  'curl -fsSL https://raw.githubusercontent.com/QwenLM/Qwen-MM-Plugins/main/install.sh | bash';

function ToolDefinition({
  tool,
  initialOpen,
}: {
  tool: Tool;
  initialOpen: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const schema = tool.inputSchema;
  const fields = Object.entries(schema.properties || {});
  const definition = JSON.stringify(
    { name: tool.name, description: tool.description, inputSchema: schema },
    null,
    2,
  );
  return (
    <details
      id={`tool-${tool.name}`}
      className="tool-definition"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>
        <Braces size={17} />
        <code>{tool.name}</code>
        <span>{fields.length} parameters</span>
        <ChevronDown className="tool-chevron" size={17} />
      </summary>
      <div className="tool-body">
        <p>{tool.description}</p>
        <div className="tool-actions">
          <a href={tool.sourceUrl}>
            View source <ArrowUpRight size={13} />
          </a>
          <a href={`#tool-${tool.name}`} onClick={() => setOpen(true)}>
            Permalink
          </a>
          <CopyButton text={definition} label="Copy definition" />
        </div>
        {fields.length > 0 ? (
          <Table className="parameter-table">
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map(([name, field]) => (
                <TableRow key={name}>
                  <TableCell>
                    <code>{name}</code>
                    {schema.required?.includes(name) ? (
                      <span className="required-label">required</span>
                    ) : (
                      <span className="optional-label">optional</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="type-code">{schemaType(field)}</code>
                  </TableCell>
                  <TableCell>
                    <p>{field.description || '—'}</p>
                    {Object.hasOwn(field, 'default') && (
                      <div className="field-constraint">
                        Default: <code>{JSON.stringify(field.default)}</code>
                      </div>
                    )}
                    {field.enum && (
                      <div className="field-constraint">
                        Values:{' '}
                        <code>
                          {field.enum.map((v) => JSON.stringify(v)).join(' · ')}
                        </code>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="no-parameters">This tool takes no parameters.</div>
        )}
        <details className="json-disclosure">
          <summary>Full JSON definition</summary>
          <pre>{definition}</pre>
        </details>
      </div>
    </details>
  );
}

export function PluginDetail({
  plugin: p,
  contributors,
  skillPreview,
}: {
  plugin: Plugin;
  contributors: Record<string, Contributor>;
  skillPreview: ReactNode;
}) {
  const [tab, setTab] = useState('skill');
  const [skillView, setSkillView] = useState('preview');
  const [query, setQuery] = useState('');
  const [linkedTool, setLinkedTool] = useState('');
  useEffect(() => {
    function fromHash() {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('tool-')) {
        setTab('tools');
        setQuery('');
        setLinkedTool(hash);
        window.setTimeout(
          () =>
            document.getElementById(hash)?.scrollIntoView({ block: 'start' }),
          100,
        );
      } else if (['skill', 'tools', 'install'].includes(hash)) setTab(hash);
    }
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);
  const tools = p.tools.filter((t) =>
    `${t.name} ${t.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <a className="skip-link" href="#plugin-content">
        Skip to plugin content
      </a>
      <SiteHeader />
      <main className="detail-shell">
        <Link href="/" className="back-link">
          <ArrowLeft size={15} />
          All plugins
        </Link>
        <div className="plugin-hero">
          <PluginIcon icon={p.icon} color={p.color} large />
          <div className="plugin-hero-title">
            <div className="hero-byline">
              {p.contributors.map((c) => (
                <Link key={c} href={`/?contributor=${c}`}>
                  {contributors[c]?.name || c}
                  <span className="verified">
                    <Check size={10} />
                  </span>
                </Link>
              ))}
              <span>/</span>
              <span>{p.id}</span>
            </div>
            <h1>
              {p.title}
              <span className="version-badge">v{p.version}</span>
            </h1>
            <p className="package-name">{p.name}</p>
          </div>
          <a className="source-button" href={p.source.url + p.source.path}>
            <CodeXml size={16} />
            Source
            <ArrowUpRight size={14} />
          </a>
        </div>
        <p className="plugin-description">
          {p.description.replace(/^Qwen-MM-Plugins\s+[^—]+—\s*/i, '')}
        </p>
        <div className="detail-tags">
          <span className="kind-badge">{p.kind}</span>
          {p.tags.map((t) => (
            <Link
              className="tag"
              key={t}
              href={`/?tag=${encodeURIComponent(t)}`}
            >
              {t}
            </Link>
          ))}
        </div>
        <div className="detail-layout">
          <section id="plugin-content" className="detail-main">
            <Tabs
              value={tab}
              onValueChange={(value) => {
                setTab(String(value));
                window.history.replaceState(null, '', '#' + value);
              }}
            >
              <TabsList variant="line" className="detail-tabs">
                <TabsTrigger value="skill">
                  <BookOpen size={16} />
                  Skill
                </TabsTrigger>
                <TabsTrigger value="tools">
                  <Braces size={16} />
                  Tools<span className="tab-count">{p.tools.length}</span>
                </TabsTrigger>
                <TabsTrigger value="install">
                  <Terminal size={16} />
                  Install
                </TabsTrigger>
              </TabsList>
              <TabsContent value="skill">
                <div className="skill-file-bar">
                  <span>
                    <FileText size={15} />
                    SKILL.md
                  </span>
                  <div className="skill-bar-actions">
                    <Tabs
                      value={skillView}
                      onValueChange={(v) => setSkillView(String(v))}
                    >
                      <TabsList className="view-switch">
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="raw">Raw</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <CopyButton text={p.skill.raw} label="Copy Skill" />
                    <a
                      aria-label="View Skill on GitHub"
                      href={p.skill.sourceUrl}
                    >
                      <ArrowUpRight size={17} />
                    </a>
                  </div>
                </div>
                {skillView === 'preview' ? (
                  skillPreview
                ) : (
                  <pre className="raw-skill">{p.skill.raw}</pre>
                )}
              </TabsContent>
              <TabsContent value="tools">
                <div className="tools-heading">
                  <h2>Tool definitions</h2>
                  <p>
                    Names, descriptions, and input schemas exposed by this
                    plugin’s MCP server.
                  </p>
                </div>
                {p.tools.length ? (
                  <>
                    <div className="search-field tool-search">
                      <Search size={17} />
                      <input
                        aria-label="Search tool definitions"
                        placeholder="Find a tool…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <div className="tools-count" aria-live="polite">
                      {tools.length} of {p.tools.length} tools
                    </div>
                    {tools.map((tool, i) => (
                      <ToolDefinition
                        key={tool.name + linkedTool}
                        tool={tool}
                        initialOpen={
                          linkedTool === `tool-${tool.name}` ||
                          (!linkedTool && i === 0)
                        }
                      />
                    ))}
                    {!tools.length && (
                      <p className="empty-tool-search">
                        No tools match “{query}”.{' '}
                        <button onClick={() => setQuery('')}>
                          Clear search
                        </button>
                      </p>
                    )}
                  </>
                ) : (
                  <div className="skill-only-note">
                    <BookOpen size={28} />
                    <h3>A Skill-only plugin</h3>
                    <p>
                      This plugin provides instructions and bundled resources.
                      It does not ship an MCP server or expose tool definitions.
                    </p>
                    <button onClick={() => setTab('skill')}>
                      Read the Skill <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="install">
                <div className="install-content">
                  <h2>Add {p.title} to your agent</h2>
                  <p>
                    Run the guided installer, choose your agent harness, then
                    select <strong>{p.id}</strong>.
                  </p>
                  <div className="install-command">
                    <div>
                      <span>Terminal</span>
                      <CopyButton text={installCommand} />
                    </div>
                    <pre>{installCommand}</pre>
                  </div>
                  <p>
                    The installer supports Claude Code, CodeBuddy, Codex, Qoder,
                    OpenClaw, Qwen Code, and Gemini CLI.
                  </p>
                  <a
                    className="documentation-link"
                    href="https://github.com/QwenLM/Qwen-MM-Plugins/blob/main/docs/en/installation.md"
                  >
                    Installation guide <ArrowUpRight size={15} />
                  </a>
                  {p.requirements.length > 0 && (
                    <>
                      <h3>System requirements</h3>
                      <ul>
                        {p.requirements.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <p>
                    Provider keys and optional dependencies depend on the tools
                    you use. The cookbook covers setup and examples for this
                    plugin.
                  </p>
                  <a className="documentation-link" href={p.cookbookUrl}>
                    Open cookbook <ArrowUpRight size={15} />
                  </a>
                </div>
              </TabsContent>
            </Tabs>
          </section>
          <aside className="detail-sidebar">
            <section>
              <h2>Plugin details</h2>
              <dl>
                <div>
                  <dt>Contributor</dt>
                  <dd>
                    {p.contributors.map((c) => (
                      <a key={c} href={contributors[c]?.url}>
                        {contributors[c]?.name}
                      </a>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt>Capability</dt>
                  <dd>{p.category}</dd>
                </div>
                <div>
                  <dt>Includes</dt>
                  <dd>1 Skill · {p.tools.length} tools</dd>
                </div>
                <div>
                  <dt>License</dt>
                  <dd>Apache 2.0</dd>
                </div>
              </dl>
            </section>
            <section>
              <h2>Resources</h2>
              <a className="resource-link" href={p.cookbookUrl}>
                <BookOpen size={15} />
                Cookbook
                <ArrowUpRight size={13} />
              </a>
              <a className="resource-link" href={p.skill.sourceUrl}>
                <FileText size={15} />
                Skill source
                <ArrowUpRight size={13} />
              </a>
              <a className="resource-link" href={p.source.url + p.source.path}>
                <CodeXml size={15} />
                Plugin source
                <ArrowUpRight size={13} />
              </a>
            </section>
            <section className="source-note">
              <span className="live-dot" />
              <h2>From the source</h2>
              <p>
                Built from the upstream main branch. Definitions and Skills
                refer to the same source snapshot.
              </p>
              <a href={`${p.source.repository}/commit/${p.source.commit}`}>
                View source snapshot <ArrowUpRight size={13} />
              </a>
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
