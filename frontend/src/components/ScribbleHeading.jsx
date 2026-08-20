export default function ScribbleHeading({ children, className = '' }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <svg
        className="absolute left-0 top-1/2 -translate-y-1/2 w-full pointer-events-none"
        viewBox="0 0 300 40"
        preserveAspectRatio="none"
        style={{ height: '60%' }}
      >
        <path
          d="M5 20 C 50 5, 90 35, 140 15 C 190 -5, 230 30, 295 18"
          fill="none"
          stroke="#2196F3"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}