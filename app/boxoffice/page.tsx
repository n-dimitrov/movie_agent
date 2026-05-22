"use client";

import { useState, useEffect } from "react";
import { DigestViewer } from "@/components/digest-viewer";
import { DigestHistory } from "@/components/digest-history";

interface DigestMetadata {
  id: string;
  date: string;
  url: string;
}

export default function BoxOffice() {
  const [digests, setDigests] = useState<DigestMetadata[]>([]);
  const [selectedDigest, setSelectedDigest] = useState<{
    id: string;
    content: string;
    shareableUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchDigests();
  }, []);

  const fetchDigests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/boxoffice");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: DigestMetadata[] = await res.json();
      setDigests(data);
    } catch {
      setDigests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/boxoffice", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate");
      const { id, url }: { id: string; url: string } = await res.json();

      const contentRes = await fetch(`/api/boxoffice/${id}`);
      if (!contentRes.ok) throw new Error("Failed to fetch content");
      const content = await contentRes.text();

      setSelectedDigest({ id, content, shareableUrl: url });
      await fetchDigests();
    } catch {
      setSelectedDigest(null);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectDigest = async (id: string, shareableUrl: string) => {
    try {
      const res = await fetch(`/api/boxoffice/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const content = await res.text();
      setSelectedDigest({ id, content, shareableUrl });
    } catch {
      setSelectedDigest(null);
    }
  };

  return (
    <>
      <header className="bg-surface px-6 py-5 border-b border-border">
        <h1 className="text-2xl font-bold mb-4">
          <span className="mr-2">📊</span>Box Office Tracker
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-lg text-sm font-semibold transition-transform hover:scale-[1.03] disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Digest"}
          </button>
          <span className="text-xs text-muted">
            Generate the latest box office analysis
          </span>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {selectedDigest ? (
              <DigestViewer
                content={selectedDigest.content}
                shareableUrl={selectedDigest.shareableUrl}
              />
            ) : (
              <div className="bg-surface border border-border rounded-lg p-8 text-center text-muted">
                <p className="text-lg mb-2">No digest selected</p>
                <p className="text-sm">
                  Generate a new digest or select one from the history
                </p>
              </div>
            )}
          </div>

          <div>
            <DigestHistory
              digests={digests}
              loading={loading}
              onSelect={handleSelectDigest}
              selectedId={selectedDigest?.id}
            />
          </div>
        </div>
      </main>
    </>
  );
}
