import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../api/axiosInstance';
import Header from '../components/Header';

const CATEGORY_COLORS = [
  'bg-shop-primary',
  'bg-shop-accent',
  'bg-shop-deliverable',
  'bg-shop-highlight',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    publicApi.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const handleCategoryClick = (cat) => {
    navigate(`/?category=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`);
  };

  return (
    <div className="min-h-screen bg-shop-bg">
      <Header />
      <div className="p-6 md:p-8">
        <h1 className="font-shop-display text-2xl font-bold text-shop-text mb-1">
          All Categories
        </h1>
        <p className="text-sm text-shop-highlight mb-6">
          Browse everything we stock, organized by type.
        </p>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className="flex flex-col items-center"
            >
              <div className="bg-shop-card rounded-2xl p-[3px] shadow-sm hover:shadow-md transition w-full">
                <div
                  className={`w-full aspect-square rounded-[13px] overflow-hidden flex items-center justify-center text-white text-2xl font-bold ${
                    cat.imageUrl ? '' : CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                  }`}
                >
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    cat.name.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <span className="text-xs text-shop-text text-center leading-tight mt-1.5">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}