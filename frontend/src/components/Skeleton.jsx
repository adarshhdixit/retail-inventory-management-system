export function SkeletonCard() {
  return (
    <div className="bg-shop-card rounded-2xl p-4 shadow-sm animate-pulse">
      <div className="h-4 bg-shop-highlight/15 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-shop-highlight/15 rounded w-1/3 mb-3"></div>
      <div className="h-8 bg-shop-highlight/15 rounded-full w-full"></div>
    </div>
  );
}

export function SkeletonLine({ width = 'w-full' }) {
  return <div className={`h-4 bg-shop-highlight/15 rounded ${width} animate-pulse`}></div>;
}

export function SkeletonOrderCard() {
  return (
    <div className="bg-shop-card rounded-2xl shadow-sm p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="h-4 bg-shop-highlight/15 rounded w-24 mb-2"></div>
          <div className="h-3 bg-shop-highlight/15 rounded w-16"></div>
        </div>
        <div className="h-6 bg-shop-highlight/15 rounded-full w-20"></div>
      </div>
      <div className="border-t border-shop-highlight/10 pt-3 space-y-2">
        <div className="h-3 bg-shop-highlight/15 rounded w-2/3"></div>
        <div className="h-3 bg-shop-highlight/15 rounded w-1/2"></div>
      </div>
    </div>
  );
}