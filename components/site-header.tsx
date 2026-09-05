import Link from '@/components/static-link';
import { ArrowUpRight, CodeXml, Layers3 } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Layers3 size={23} strokeWidth={1.7} />
          </span>
          <span>
            Qwen <span className="brand-light">MM Plugins</span>
          </span>
        </Link>
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
