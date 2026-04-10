export default function Stars({
  rating,
  reviewsCount,
}: {
  rating: number | null;
  reviewsCount?: number | null;
}) {
  if (rating == null) return <span className="text-slate-400">—</span>;

  const rounded = Math.round(rating);

  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-amber-400 tracking-wide" aria-label={`${rating} из 5`}>
        {Array.from({ length: 5 }, (_, i) =>
          i < rounded ? "★" : "☆"
        ).join("")}
      </span>
      <span className="text-lg font-semibold text-slate-900">{Number(rating).toFixed(1)}</span>
      {reviewsCount != null && (
        <span className="text-xs text-slate-500">
          ({reviewsCount.toLocaleString("ru-RU")} отзывов)
        </span>
      )}
    </span>
  );
}
