export default function StarRating({ rating = 0, size = 14 }) {
  const percentage = Math.max(0, Math.min(rating / 5, 1)) * 100;

  return (
    <div className="relative inline-flex">
      <div className="flex gap-0.5 text-shop-highlight/25">
        {[...Array(5)].map((_, i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6z" />
          </svg>
        ))}
      </div>
      <div
        className="absolute inset-0 flex gap-0.5 text-[#F5B942] overflow-hidden"
        style={{ width: `${percentage}%` }}
      >
        {[...Array(5)].map((_, i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill="currentColor" className="shrink-0">
            <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6z" />
          </svg>
        ))}
      </div>
    </div>
  );
}