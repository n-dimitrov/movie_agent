export function DigestViewer({ content }: { content: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div
        className="p-3 md:p-6 prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
