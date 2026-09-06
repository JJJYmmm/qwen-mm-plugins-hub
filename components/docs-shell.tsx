'use client';

import type { CSSProperties, ReactNode } from 'react';
import Link from '@/components/static-link';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

export type DocNavPlugin = { id: string; title: string; category: string };

function DocumentationNavigation({
  plugins,
  current,
  cookbookUrl,
}: {
  plugins: DocNavPlugin[];
  current: string;
  cookbookUrl: string;
}) {
  const { setOpenMobile } = useSidebar();
  const categories = [...new Set(plugins.map((p) => p.category))];
  return (
    <Sidebar className="docs-navigation">
      <SidebarHeader>
        <Link href="/" className="docs-project-title">
          Qwen MM Plugins
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Plugin documentation">
          <SidebarGroup>
            <SidebarGroupLabel>Get started</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/" />}>
                  Plugin directory
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href={`/plugins/${current}/#install`} />}
                  onClick={() => setOpenMobile(false)}
                >
                  Installation
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <Link href={cookbookUrl} aria-label="Read cookbook" />
                  }
                  onClick={() => setOpenMobile(false)}
                  className="docs-cookbook-link"
                >
                  <span>Cookbook</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          {categories.map((category) => (
            <SidebarGroup key={category}>
              <SidebarGroupLabel>{category}</SidebarGroupLabel>
              <SidebarMenu>
                {plugins
                  .filter((p) => p.category === category)
                  .map((p) => (
                    <SidebarMenuItem key={p.id}>
                      <SidebarMenuButton
                        isActive={p.id === current}
                        render={
                          <Link
                            href={`/plugins/${p.id}/`}
                            aria-current={p.id === current ? 'page' : undefined}
                          />
                        }
                        onClick={() => setOpenMobile(false)}
                      >
                        {p.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}

export function DocsShell({
  children,
  plugins,
  current,
  cookbookUrl,
}: {
  children: ReactNode;
  plugins: DocNavPlugin[];
  current: string;
  cookbookUrl: string;
}) {
  return (
    <SidebarProvider
      className="docs-provider"
      style={{ '--sidebar-width': '270px' } as CSSProperties}
    >
      <DocumentationNavigation
        plugins={plugins}
        current={current}
        cookbookUrl={cookbookUrl}
      />
      <div className="docs-workspace">
        <div className="docs-mobile-navigation">
          <SidebarTrigger />
          <span>Documentation menu</span>
        </div>
        {children}
      </div>
    </SidebarProvider>
  );
}
