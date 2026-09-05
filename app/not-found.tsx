import Link from '@/components/static-link';
import { SiteHeader } from '@/components/site-header';
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="empty-state">
        <h1>Plugin not found</h1>
        <p>
          This page may have moved, or the plugin is not in the directory yet.
        </p>
        <Link className="documentation-link" href="/">
          Browse plugins →
        </Link>
      </main>
    </>
  );
}
