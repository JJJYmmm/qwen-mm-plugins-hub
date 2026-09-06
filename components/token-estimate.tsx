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
      aria-label="Estimated content tokens"
    >
      <Collapsible>
        <div className="token-estimate-row">
          <h2>Content tokens</h2>
          <dl className="token-estimate-values">
            <div data-token-kind="skill">
              <dt>Skill</dt>
              <dd>≈ {formatTokens(estimate.skillFull)}</dd>
            </div>
            <div data-token-kind="tools">
              <dt>Tools</dt>
              <dd>≈ {formatTokens(estimate.toolsTotal)}</dd>
            </div>
          </dl>
          <CollapsibleTrigger
            className="token-method-trigger"
            aria-label={`Token counting details (${tokenizer.label})`}
          >
            {tokenizer.label} · Details <ChevronDown size={14} />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="token-method-content">
          <p>
            Counted with <a href={tokenizer.sourceUrl}>{tokenizer.modelId}</a>{' '}
            at <code>{tokenizer.revision.slice(0, 7)}</code>, without added
            special tokens.
          </p>
          <ul>
            <li>
              <strong>Skill:</strong> complete SKILL.md, including front matter.
            </li>
            <li>
              <strong>Tools:</strong> summed JSON from “Copy definition” (name,
              description, inputSchema).
            </li>
            <li>
              <strong>Discovery metadata:</strong> ≈{' '}
              {formatTokens(estimate.skillMetadata)} tokens for the Skill’s name
              and description; counted separately.
            </li>
          </ul>
          <p>
            Excludes bundled files, cookbooks, client wrappers, history, tool
            results, and media. Content estimates are not always-loaded context
            or billed usage.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
