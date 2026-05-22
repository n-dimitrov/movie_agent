"use client";

interface DigestMetadata {
  id: string;
  date: string;
  url: string;
}

export function DigestHistory({
  digests,
  loading,
  onSelect,
  selectedId,
}: {
  digests: DigestMetadata[];
  loading: boolean;
  onSelect: (id: string, url: string) => void;
  selectedId?: string;
}) {
  const formatDate = (id: string) => {
    const year = id.substring(0, 4);
    const month = id.substring(4, 6);
    const day = id.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Digest History</h3>
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Digest History</h3>
      {digests.length === 0 ? (
        <p className="text-sm text-muted">No digests yet</p>
      ) : (
        <ul className="space-y-2">
          {digests.map((digest) => (
            <li key={digest.id}>
              <button
                onClick={() => onSelect(digest.id, digest.url)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  selectedId === digest.id
                    ? "bg-accent text-white"
                    : "bg-surface-hover hover:bg-border text-foreground"
                }`}
              >
                <span className="text-sm font-medium block">
                  {formatDate(digest.id)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
