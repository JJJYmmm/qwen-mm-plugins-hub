'use client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyButton({
  text,
  label = 'Copy',
}: {
  text: string;
  label?: string;
}) {
  const [status, setStatus] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied');
    } catch {
      setStatus('Select text to copy');
    }
    window.setTimeout(() => setStatus(''), 2500);
  }
  return (
    <button
      className="copy-button"
      onClick={copy}
      aria-label={label}
      aria-live="polite"
    >
      {status === 'Copied' ? <Check size={14} /> : <Copy size={14} />}
      <span>{status || label}</span>
    </button>
  );
}
