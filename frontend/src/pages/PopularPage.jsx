import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../api/axiosInstance';
import Header from '../components/Header';
import PopularProductCard from '../components/PopularProductCard';
import { SkeletonCard } from '../components/Skeleton';

export default function PopularPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.get('/products/popular').then((res) => {
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
        <h1 className="font-shop-display text-2xl font-bold text-shop-text mb-1">Popular Right Now</h1>
        <p className="text-sm text-shop-highlight mb-6">What people are picking up today.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product) => <PopularProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </div>
  );
}