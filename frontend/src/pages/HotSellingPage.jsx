import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../api/axiosInstance';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Skeleton';

export default function HotSellingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.get('/products/hot-selling?limit=20').then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-shop-bg">
      <Header />
      <div className="p-6 md:p-8">
        <Link to="/" className="text-shop-highlight text-sm hover:text-shop-primary transition inline-block mb-4">
          ← Back to store
        </Link>
        <h1 className="font-shop-display text-2xl font-bold text-shop-text mb-1">🔥 Hot Selling</h1>
        <p className="text-sm text-shop-highlight mb-6">Our most loved products this week.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product) => (
                <ProductCard key={product.id} product={product} serviceable={true} />
              ))}
        </div>

        {!loading && products.length === 0 && (
          <p className="text-shop-highlight text-sm mt-4">No sales data yet.</p>
        )}
      </div>
    </div>
  );
}