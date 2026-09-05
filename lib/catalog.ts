export type Contributor = { name: string; url: string };
export type Schema = {
  type?: string | string[];
  description?: string;
  default?: unknown;
  enum?: unknown[];
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  anyOf?: Schema[];
  oneOf?: Schema[];
  [key: string]: unknown;
};
export type Tool = {
  name: string;
  description: string;
  inputSchema: Schema;
  sourceUrl: string;
};
export type Plugin = Omit<PluginSummary, 'toolCount' | 'toolNames'> & {
  skill: {
    name: string;
    description: string;
    markdown: string;
    raw: string;
    path: string;
    sourceUrl: string;
  };
  tools: Tool[];
  moduleDocstring: string;
  requirements: string[];
};

export function schemaType(schema: Schema): string {
  if (schema.anyOf || schema.oneOf)
    return (schema.anyOf || schema.oneOf || []).map(schemaType).join(' | ');
  if (Array.isArray(schema.type)) return schema.type.join(' | ');
  if (schema.type === 'array') return `${schemaType(schema.items || {})}[]`;
  return schema.type || (schema.enum ? 'enum' : 'any');
}
export type PluginSummary = {
  id: string;
  name: string;
  title: string;
  version: string;
  description: string;
  contributors: string[];
  category: string;
  tags: string[];
  kind: string;
  icon: string;
  color: string;
  order: number;
  channel: string;
  toolCount: number;
  toolNames: string[];
  source: {
    url: string;
    path: string;
    commit: string;
    date: string;
    repository: string;
  };
  cookbookUrl: string;
};

export function filterPlugins(
  plugins: PluginSummary[],
  query: string,
  category: string,
  contributor: string,
  tags: string[],
) {
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return plugins.filter((p) => {
    const text = [p.name, p.title, p.description, ...p.tags, ...p.toolNames]
      .join(' ')
      .toLocaleLowerCase();
    return (
      (!category || p.category === category) &&
      (!contributor || p.contributors.includes(contributor)) &&
      tags.every((t) => p.tags.includes(t)) &&
      words.every((w) => text.includes(w))
    );
  });
}
