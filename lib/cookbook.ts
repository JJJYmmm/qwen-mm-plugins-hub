import GithubSlugger from 'github-slugger';

/** Map cookbook-local references to hosted assets, retaining repository links for other files. */
export function cookbookUrl(
  url: string,
  id: string,
  sourceUrl: string,
  base = '',
): string {
  if (!url || url.startsWith('#') || /^(https?:|mailto:)/.test(url)) return url;
  const resolved = new URL(
    url,
    `https://cookbook.local/content/cookbooks/${id}/usage.md`,
  );
  if (resolved.origin !== 'https://cookbook.local') return '';
  if (resolved.pathname.startsWith('/public/cases/')) {
    return (
      base +
      resolved.pathname.slice('/public'.length) +
      resolved.search +
      resolved.hash
    );
  }
  if (resolved.pathname.startsWith('/cases/'))
    return base + resolved.pathname + resolved.search + resolved.hash;
  if (
    resolved.pathname.startsWith('/content/cookbooks/') &&
    resolved.pathname.endsWith('/usage.md')
  ) {
    return `${base}/plugins/${resolved.pathname.split('/')[3]}/cookbook/${resolved.hash}`;
  }
  return new URL(url, sourceUrl).href;
}

type MarkdownNode = {
  type: string;
  value?: string;
  url?: string;
  depth?: number;
  children?: MarkdownNode[];
  data?: Record<string, unknown>;
};
type TextNode = { value?: string; children?: TextNode[] };
export function nodeText(node: TextNode): string {
  return node.value || node.children?.map(nodeText).join('') || '';
}

/** Body and outline share the same GitHub-compatible heading IDs. */
export function markdownHeadings() {
  return (tree: MarkdownNode) => {
    const headings = new GithubSlugger();
    function visit(node: MarkdownNode) {
      if (node.type === 'heading') {
        node.data = {
          ...node.data,
          hProperties: { id: headings.slug(nodeText(node)) },
        };
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}

/** Move demo embeds out of paragraphs/strong tags, so the exported HTML remains valid. */
export function cookbookEmbeds({ id }: { id: string }) {
  return (tree: MarkdownNode) => {
    markdownHeadings()(tree);
    function visit(parent: MarkdownNode) {
      const children: MarkdownNode[] = [];
      for (const node of parent.children || []) {
        if (node.type === 'paragraph') {
          const media: MarkdownNode[] = [];
          function collect(n: MarkdownNode) {
            if (
              n.type === 'link' &&
              n.url &&
              /\.(mp4|webm|html)$/.test(n.url)
            ) {
              const local = new URL(
                n.url,
                `https://cookbook.local/content/cookbooks/${id}/usage.md`,
              );
              if (
                local.origin === 'https://cookbook.local' &&
                local.pathname.startsWith('/public/cases/')
              )
                media.push({
                  ...n,
                  url: local.pathname.slice('/public'.length),
                });
            }
            n.children?.forEach(collect);
          }
          collect(node);
          children.push(node);
          for (const item of media)
            children.push({
              type: 'paragraph',
              children: [],
              data: {
                hName: item.url!.endsWith('.html')
                  ? 'cookbook-case'
                  : 'cookbook-video',
                hProperties: { src: item.url, title: nodeText(item) },
              },
            });
        } else {
          visit(node);
          children.push(node);
        }
      }
      parent.children = children;
    }
    visit(tree);
  };
}
