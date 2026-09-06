'use client';

import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  formatTokens,
  type PluginSummary,
  type TokenizerInfo,
} from '@/lib/catalog';

export function TokenEstimate({
  estimate,
  tokenizer,
}: {
  estimate: PluginSummary['tokenEstimate'];
  tokenizer: TokenizerInfo;
}) {
  return (
    <section
      id="tokens"
      className="token-estimate"
      aria-label="Estimated context tokens"
    >
      <div className="token-estimate-heading">
        <h2>Estimated tokens</h2>
        <span>{tokenizer.label}</span>
      </div>
      <dl className="token-estimate-values">
        <div>
          <dt>Full SKILL.md</dt>
          <dd>
            ≈ {formatTokens(estimate.skillFull)} <span>tokens</span>
          </dd>
        </div>
        <div>
          <dt>All tool definitions</dt>
          <dd>
            ≈ {formatTokens(estimate.toolsTotal)} <span>tokens</span>
          </dd>
        </div>
      </dl>
      <p className="token-estimate-note">
        Content only—not runtime or billed usage.
      </p>
      <Collapsible>
        <CollapsibleTrigger className="token-method-trigger">
          How this is counted <ChevronDown size={14} />
        </CollapsibleTrigger>
        <CollapsibleContent className="token-method-content">
          <p>
            Reference tokenizer:{' '}
            <a href={tokenizer.sourceUrl}>{tokenizer.modelId}</a> at{' '}
            <code>{tokenizer.revision.slice(0, 7)}</code>. Computed at build
            time with the official tokenizer, without padding, truncation, or
            added special tokens.
          </p>
          <ul>
            <li>
              <strong>Skill:</strong> the complete SKILL.md, including YAML
              front matter—not just the first 50 preview lines. Bundled files
              and cookbooks are excluded.
            </li>
            <li>
              <strong>Tools:</strong> the sum of each tool’s formatted MCP JSON
              (name, description, inputSchema), exactly as offered by “Copy
              definition”. No extra registry metadata is included.
            </li>
            <li>
              <strong>Discovery metadata only:</strong> ≈{' '}
              {formatTokens(estimate.skillMetadata)} tokens for the Skill’s name
              and description as formatted JSON. This is a separate estimate,
              not added to the full Skill count.
            </li>
          </ul>
          <p>
            Content size is not always-loaded context or billed usage. A client
            may load Skills on demand, expose only selected tools, or add its
            own chat template, instructions, and wrappers. Tool results,
            conversation history, images, audio, and video are not counted.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
