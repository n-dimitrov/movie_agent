"use client";

import { useState } from "react";

export function DigestViewer({
  content,
  shareableUrl,
}: {
  content: string;
  shareableUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Box Office Digest</h2>
        <button
          onClick={handleCopy}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded text-sm font-semibold transition-transform hover:scale-[1.03]"
        >
          {copied ? "✓ Copied" : "Share"}
        </button>
      </div>
      <div
        className="p-6 prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
