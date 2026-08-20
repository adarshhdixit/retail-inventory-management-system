import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../api/axiosInstance';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Skeleton';

export default function NewlyAddedPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.get('/products?sort=id,desc&size=20&page=0').then((res) => {
      setProducts(res.data.content);
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
        <h1 className="font-shop-display text-2xl font-bold text-shop-text mb-1">✨ Newly Added</h1>
        <p className="text-sm text-shop-highlight mb-6">Fresh stock, just added.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product) => (
                <ProductCard key={product.id} product={product} serviceable={true} />
              ))}
        </div>
      </div>
    </div>
  );
}