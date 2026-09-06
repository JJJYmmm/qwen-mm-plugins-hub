import Link from '@/components/static-link';
import Image from 'next/image';
import { ArrowUpRight, CodeXml, Search, BookOpen } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <Image
            className="brand-mark"
            src={(process.env.NEXT_PUBLIC_BASE_PATH || '') + '/favicon.svg'}
            width={32}
            height={32}
            alt=""
            unoptimized
          />
          <span>
            Qwen <span className="brand-light">MM Plugins</span>
          </span>
        </Link>
        <search className="header-doc-search">
          <form action={(process.env.NEXT_PUBLIC_BASE_PATH || '') + '/'}>
            <Search size={16} />
            <input
              name="q"
              aria-label="Search plugin documentation"
              placeholder="Search plugins, Skills, tools…"
            />
          </form>
        </search>
        <nav aria-label="Main navigation">
          <Link className="nav-active" href="/">
            Plugins
          </Link>
          <a href="https://github.com/QwenLM/Qwen-MM-Plugins/tree/main/docs/en">
            Docs <ArrowUpRight size={14} />
          </a>
          <a
            className="github-link"
            href="https://github.com/QwenLM/Qwen-MM-Plugins"
          >
            <CodeXml size={18} />
            <span>GitHub</span>
          </a>
        </nav>
      </div>
      <div className="documentation-bar">
        <BookOpen size={16} />
        <Link href="/">Qwen MM Plugins documentation</Link>
        <span>main</span>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>
        Qwen MM Plugins <span className="footer-dot">·</span> Open-source
        multimodal capabilities
      </span>
      <a href="https://github.com/JJJYmmm/qwen-mm-plugins-hub">
        About this directory <ArrowUpRight size={13} />
      </a>
      <a href="https://github.com/QwenLM/Qwen-MM-Plugins/blob/main/LICENSE">
        Apache 2.0
      </a>
    </footer>
  );
}
