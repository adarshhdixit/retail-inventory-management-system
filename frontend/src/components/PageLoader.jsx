import { useEffect, useState } from 'react';

const QUOTES = [
  "Sharpening pixels, not just pencils.",
  "Good things take a few seconds. Great deliveries take fifteen minutes.",
  "Every great idea starts with a blank page.",
  "Loading faster than your Monday morning motivation.",
  "Precision takes a moment. Worth the wait.",
];

export default function PageLoader() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        setFade(true);
      }, 200);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-shop-bg flex flex-col items-center justify-center z-[300]">
      <svg width="120" height="80" viewBox="0 0 120 80" className="mb-6">
        <path
          id="loaderPath"
          d="M10 60 Q 30 20, 60 40 T 110 30"
          fill="none"
          stroke="#F0E5D8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M10 60 Q 30 20, 60 40 T 110 30"
          fill="none"
          stroke="#FF715B"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="140"
          strokeDashoffset="140"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="140"
            to="0"
            dur="1.4s"
            repeatCount="indefinite"
          />
        </path>
        <g>
          <animateMotion dur="1.4s" repeatCount="indefinite" path="M10 60 Q 30 20, 60 40 T 110 30" />
          <path
            d="M0 0 L8 -2 L10 2 L2 8 Z"
            fill="#1A1A2E"
            transform="rotate(45)"
          />
        </g>
      </svg>

      <span
        className="text-2xl mb-4"
        style={{ fontFamily: '"Luckiest Guy", cursive', color: '#16476A' }}
      >
        DXT
      </span>

      <p
        className={`text-sm text-shop-highlight max-w-xs text-center px-6 transition-opacity duration-200 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {QUOTES[quoteIndex]}
      </p>
    </div>
  );
}