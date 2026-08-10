export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="fixed inset-0 bg-shop-bg flex flex-col items-center justify-center z-[300] px-6">
      <svg width="90" height="90" viewBox="0 0 90 90" className="mb-6">
        <circle cx="45" cy="45" r="42" fill="none" stroke="#F0E5D8" strokeWidth="4" />
        <path
          d="M30 30 L60 60 M60 30 L30 60"
          stroke="#C97064"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>

      <h2 className="font-shop-display text-lg font-bold text-shop-text mb-2">
        Lost the thread
      </h2>
      <p className="text-sm text-shop-highlight text-center max-w-xs mb-6">
        {message}
      </p>

      <button
        onClick={onRetry}
        className="bg-shop-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-shop-primary-dark transition"
      >
        Try Again
      </button>
    </div>
  );
}