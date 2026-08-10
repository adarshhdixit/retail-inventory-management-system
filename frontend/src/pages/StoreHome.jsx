import { publicApi } from '../api/axiosInstance';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCustomerLocation } from '../utils/locationCheck';
import Header from '../components/Header';
import Modal from '../components/Modal';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import { SkeletonCard } from '../components/Skeleton';

const CATEGORY_COLORS = [
  'bg-shop-primary',
  'bg-shop-accent',
  'bg-shop-deliverable',
  'bg-shop-highlight',
];

function StoreHome() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [serviceable, setServiceable] = useState(null);
  const [heroBanner, setHeroBanner] = useState(null);
  const [secondaryBanners, setSecondaryBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [selectedColors, setSelectedColors] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [locationBlockedModal, setLocationBlockedModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(false);
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();

  const activeCategoryId = searchParams.get('category');
  const activeCategoryName = searchParams.get('categoryName');

  const getCartQuantity = (productId, variantId) => {
    const item = cartItems.find(
      (i) => i.product.id === productId && (i.variant?.id ?? null) === (variantId ?? null)
    );
    return item ? item.quantity : 0;
  };

  const handleDecrement = (productId, variantId, currentQty) => {
    if (currentQty <= 1) {
      removeFromCart(productId, variantId);
    } else {
      updateQuantity(productId, variantId, currentQty - 1);
    }
  };

  useEffect(() => {
    setSubCategoryFilter('');
    setProductsLoading(true);
    if (activeCategoryId) {
      publicApi.get(`/products/by-category/${activeCategoryId}`).then((res) => {
        setProducts(res.data.content || res.data);
        setProductsLoading(false);
      });
    } else {
      publicApi.get('/products').then((res) => {
        setProducts(res.data.content || res.data);
        setProductsLoading(false);
      });
    }
  }, [activeCategoryId]);

  const loadInitialData = () => {
    setPageLoading(true);
    setPageError(false);

    Promise.all([
      publicApi.get('/banners/active').catch(() => ({ data: [] })),
      publicApi.get('/categories'),
    ])
      .then(([bannersRes, categoriesRes]) => {
        const banners = bannersRes.data;
        setHeroBanner(banners.find((b) => b.type === 'HERO') || null);
        setSecondaryBanners(banners.filter((b) => b.type === 'SECONDARY').slice(0, 4));
        setCategories(categoriesRes.data);
        setPageLoading(false);
      })
      .catch(() => {
        setPageError(true);
        setPageLoading(false);
      });

    checkLocation();
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkLocation = () => {
    setServiceable(null);
    getCustomerLocation()
      .then((coords) => {
        return publicApi.get('/orders/check-serviceability', {
          params: { lat: coords.latitude, lng: coords.longitude },
        });
      })
      .then((res) => {
        setServiceable(res.data === 'DELIVERABLE');
      })
      .catch((error) => {
        if (error.code === 1) {
          setLocationBlockedModal(true);
        }
        setServiceable('unknown');
      });
  };

  const handleBannerClick = (banner) => {
    if (banner?.category?.id) {
      setSearchParams({ category: banner.category.id, categoryName: banner.category.name });
      window.scrollTo({ top: 700, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (category) => {
    setSearchParams({ category: category.id, categoryName: category.name });
    window.scrollTo({ top: 700, behavior: 'smooth' });
  };

  const availableSubCategories = [
    ...new Set(products.map((p) => p.subCategory).filter(Boolean)),
  ];

  const displayedProducts = subCategoryFilter
    ? products.filter((p) => p.subCategory === subCategoryFilter)
    : products;

  if (pageLoading) return <PageLoader />;
  if (pageError) {
    return (
      <ErrorState
        message="We couldn't load the store right now. Please check your connection and try again."
        onRetry={loadInitialData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-shop-bg">
      {serviceable !== null && (
        <div
          className={`overflow-hidden py-1.5 ${
            serviceable === true
              ? 'bg-shop-deliverable'
              : serviceable === false
              ? 'bg-shop-error'
              : 'bg-shop-highlight'
          }`}
        >
          <div className="animate-marquee flex whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex items-center text-white text-xs font-medium tracking-wide">
                {Array(6)
                  .fill(
                    serviceable === true
                      ? '⚡ WE DELIVER TO YOUR AREA'
                      : serviceable === false
                      ? "WE DON'T DELIVER TO YOUR LOCATION YET"
                      : 'ENABLE LOCATION TO CHECK DELIVERY'
                  )
                  .map((text, j) => (
                    <span key={j} className="mx-6 flex items-center gap-6">
                      {text}
                      {serviceable === true && <span>FREE DELIVERY ON ORDERS ABOVE ₹299</span>}
                      <span className="opacity-60">•</span>
                    </span>
                  ))}
              </span>
            ))}
          </div>
        </div>
      )}

      <Header />

      <div className="p-6 md:p-8">
        {heroBanner && !activeCategoryId && (
          <div className="relative rounded-2xl overflow-hidden mb-6 h-56 md:h-72">
            <img
              src={heroBanner.imageUrl}
              alt={heroBanner.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="relative h-full flex flex-col justify-center px-6 md:px-10 max-w-xl">
              <h2 className="font-shop-display text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">
                {heroBanner.title}
              </h2>
              {heroBanner.subtitle && (
                <p className="text-white/85 text-sm md:text-base mb-5">{heroBanner.subtitle}</p>
              )}
              <button
                onClick={() => handleBannerClick(heroBanner)}
                className="bg-white text-shop-text px-6 py-2.5 rounded-full font-semibold text-sm w-fit hover:bg-shop-primary hover:text-white transition"
              >
                {heroBanner.buttonText}
              </button>
            </div>
          </div>
        )}

        {secondaryBanners.length > 0 && !activeCategoryId && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {secondaryBanners.map((banner) => (
              <div key={banner.id} className="relative rounded-2xl overflow-hidden h-44 md:h-48">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-transparent" />
                <div className="relative h-full flex flex-col justify-between p-4">
                  <h3 className="font-shop-display text-sm md:text-base font-bold text-white leading-tight">
                    {banner.title}
                  </h3>
                  <div>
                    {banner.subtitle && (
                      <p className="font-bold text-gray-300/80 text-xs leading-snug mb-2">
                        {banner.subtitle}
                      </p>
                    )}
                    <button
                      onClick={() => handleBannerClick(banner)}
                      className="bg-white text-shop-text px-3 py-1.5 rounded-full font-semibold text-xs w-fit hover:bg-shop-primary hover:text-white transition"
                    >
                      {banner.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {categories.length > 0 && !activeCategoryId && (
          <div className="mb-8">
            <h2 className="font-shop-display text-lg font-bold text-shop-text mb-4">
              Shop by Category
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5">
              {categories.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex items-center justify-center text-white text-2xl md:text-3xl font-bold group-hover:scale-105 transition ${
                      cat.imageUrl ? '' : CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                    }`}
                  >
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      cat.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs text-shop-text text-center leading-tight">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeCategoryId && (
          <>
            {availableSubCategories.length > 0 && (
              <div className="mb-5 flex items-center gap-3">
                <label className="text-sm font-medium text-shop-text">Filter by type:</label>
                <select
                  value={subCategoryFilter}
                  onChange={(e) => setSubCategoryFilter(e.target.value)}
                  className="border border-shop-highlight/20 rounded-full px-4 py-1.5 text-sm bg-shop-card focus:outline-none focus:border-shop-primary"
                >
                  <option value="">All Types</option>
                  {availableSubCategories.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {productsLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              ) : (
                displayedProducts.map((product) => {
                  const inStockVariants = (product.variants || []).filter((v) => v.quantity > 0);
                  const currentVariant =
                    inStockVariants.length > 0
                      ? inStockVariants.find((v) => v.id === selectedColors[product.id]) ||
                        inStockVariants[0]
                      : null;
                  const currentVariantId = currentVariant?.id ?? null;
                  const cartQty = getCartQuantity(product.id, currentVariantId);

                  return (
                    <div
                      key={product.id}
                      className="relative bg-shop-card rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                    >
                      {(product.quantity === 0 || product.deliverable === false) && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-2xl">
                          <span className="bg-shop-text text-white text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full -rotate-6 shadow-md">
                            {product.quantity === 0 ? 'Out of Stock' : 'Non Deliverable'}
                          </span>
                        </div>
                      )}

                      <Link to={`/product/${product.id}`}>
                        <h2 className="font-shop-display font-semibold text-shop-text mb-1">
                          {product.name}
                        </h2>
                        <p className="font-mono text-shop-primary-dark font-bold text-sm mb-2">
                          ₹{product.price}
                        </p>
                      </Link>

                      {inStockVariants.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {inStockVariants.map((v) => (
                            <button
                              key={v.id}
                              onClick={() =>
                                setSelectedColors({ ...selectedColors, [product.id]: v.id })
                              }
                              className={`text-[10px] px-2 py-1 rounded-full border transition ${
                                currentVariantId === v.id
                                  ? 'border-shop-primary bg-shop-primary/10 text-shop-primary-dark font-semibold'
                                  : 'border-shop-highlight/20 text-shop-highlight'
                              }`}
                            >
                              {v.colorName}
                            </button>
                          ))}
                        </div>
                      )}

                      {cartQty === 0 ? (
                        <button
                          onClick={() => addToCart(product, 1, currentVariant)}
                          disabled={
                            serviceable === false ||
                            product.quantity === 0 ||
                            product.deliverable === false
                          }
                          className={`w-full py-2 rounded-full text-sm font-semibold text-white transition ${
                            serviceable === false ||
                            product.quantity === 0 ||
                            product.deliverable === false
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-shop-text hover:bg-shop-primary'
                          }`}
                        >
                          {product.quantity === 0
                            ? 'Out of Stock'
                            : product.deliverable === false
                            ? 'Non Deliverable'
                            : 'Add to Cart'}
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-shop-primary-dark bg-shop-primary/10 px-3 py-2 rounded-full whitespace-nowrap">
                            In Cart
                          </span>
                          <div className="flex items-center bg-[#00A7E1] rounded-full overflow-hidden">
                            <button
                              onClick={() =>
                                handleDecrement(product.id, currentVariantId, cartQty)
                              }
                              className="px-3 py-1.5 text-white text-lg font-bold transition hover:bg-[#00A7E1] active:bg-[#00A7E1]"
                            >
                              −
                            </button>
                            <span className="text-white font-mono font-semibold text-sm px-1">
                              {cartQty}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(product.id, currentVariantId, cartQty + 1)
                              }
                              className="px-3 py-1.5 text-white text-lg font-bold transition hover:bg-[#00A7E1] active:bg-[#00A7E1]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {!productsLoading && displayedProducts.length === 0 && (
              <p className="text-shop-highlight text-sm mt-4">No products found.</p>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={locationBlockedModal}
        onClose={() => setLocationBlockedModal(false)}
        title="Location Access Needed"
      >
        <p className="text-sm text-shop-text mb-4">
          We need your location to check if we deliver to your area. It looks like location access is currently blocked for this site.
        </p>
        <ol className="text-sm text-shop-highlight list-decimal list-inside space-y-2 mb-6">
          <li>Click the padlock icon next to the website address</li>
          <li>Go to Site settings → Location → Allow</li>
          <li>Come back and click "Enable Location" again</li>
        </ol>
        <button
          onClick={() => setLocationBlockedModal(false)}
          className="w-full bg-shop-primary text-white py-2.5 rounded-full font-semibold hover:bg-shop-primary-dark transition"
        >
          Got it
        </button>
      </Modal>
    </div>
  );
}

export default StoreHome;