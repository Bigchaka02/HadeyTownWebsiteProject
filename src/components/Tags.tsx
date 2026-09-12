// Row of small labels (tech stack, skills).
export default function Tags({ tags }: { tags: string[] }) {
  return (
    <p className="tags">
      {tags.map((t) => (
        <span key={t} className="tag">
          {t}
        </span>
      ))}
    </p>
  );
}
