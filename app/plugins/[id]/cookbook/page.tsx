import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, CodeXml } from 'lucide-react';
import catalog from '@/data/catalog.json';
import cookbooks from '@/data/cookbooks.json';
import Link from '@/components/static-link';
import { SiteHeader, SiteFooter } from '@/components/site-header';
import { DocsShell } from '@/components/docs-shell';
import { CookbookMarkdown } from '@/components/cookbook-markdown';

export function generateStaticParams() {
  return catalog.plugins.map((p) => ({ id: p.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = catalog.plugins.find((p) => p.id === id);
  return {
    title: `${p?.title || 'Plugin'} cookbook — Qwen MM Plugins`,
    description: p?.description,
  };
}
export default async function CookbookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = catalog.plugins.find((p) => p.id === id);
  const book = (
    cookbooks as Record<string, { markdown: string; sourceUrl: string }>
  )[id];
  if (!p || !book) notFound();
  return (
    <>
      <a className="skip-link" href="#cookbook-content">
        Skip to cookbook
      </a>
      <SiteHeader />
      <DocsShell
        plugins={catalog.plugins}
        current={id}
        cookbookUrl={`/plugins/${id}/cookbook/`}
      >
        <main className="detail-shell doc-detail">
          <div className="detail-layout">
            <div className="docs-article">
              <Link className="back-link" href={`/plugins/${id}/`}>
                <ArrowLeft size={15} />
                {p.title} overview
              </Link>
              <div className="cookbook-heading">
                <span>COOKBOOK</span>
                <a href={book.sourceUrl}>
                  <CodeXml size={15} />
                  Source Markdown
                </a>
              </div>
              <section id="cookbook-content">
                <CookbookMarkdown
                  markdown={book.markdown}
                  id={id}
                  sourceUrl={book.sourceUrl}
                />
              </section>
            </div>
            <aside className="detail-sidebar">
              <nav className="docs-toc" aria-label="On this page">
                <h2>Plugin documentation</h2>
                <Link href={`/plugins/${id}/#skill`}>Skill</Link>
                <Link href={`/plugins/${id}/#tools`}>Tool definitions</Link>
                <Link href={`/plugins/${id}/#install`}>Installation</Link>
                <a href={book.sourceUrl}>Edit cookbook on GitHub</a>
              </nav>
            </aside>
          </div>
          <SiteFooter />
        </main>
      </DocsShell>
    </>
  );
}
