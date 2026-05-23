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
  onSelect: (id: string) => void;
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

  if (loading || digests.length === 0) return null;

  return (
    <select
      value={selectedId ?? ""}
      onChange={(e) => {
        const digest = digests.find((d) => d.id === e.target.value);
        if (digest) onSelect(digest.id);
      }}
      className="bg-surface-hover text-foreground border border-border rounded-lg px-3 py-2 text-sm"
    >
      <option value="" disabled>
        Select digest...
      </option>
      {digests.map((digest) => (
        <option key={digest.id} value={digest.id}>
          {formatDate(digest.id)}
        </option>
      ))}
    </select>
  );
}
