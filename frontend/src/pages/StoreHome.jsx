import { publicApi } from '../api/axiosInstance';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCustomerLocation } from '../utils/locationCheck';
import Header from '../components/Header';
import Modal from '../components/Modal';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import ScribbleHeading from '../components/ScribbleHeading';
import { SkeletonCard } from '../components/Skeleton';

const CATEGORY_COLORS = [
  'bg-shop-primary',
  'bg-shop-accent',
  'bg-shop-deliverable',
  'bg-shop-highlight',
];

const QUICK_ITEMS = ['Pen', 'Pencil', 'Marker', 'Eraser', 'Sharpener', 'Highlighter', 'Notebook', 'Glue'];

function chunkWords(text, wordsPerLine) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(' '));
  }
  return lines;
}
function StoreHome() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [serviceable, setServiceable] = useState(null);
  const [heroBanners, setHeroBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
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
  const activeKeyword = searchParams.get('keyword');

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
    if (activeKeyword) {
      publicApi.get(`/products/search?keyword=${encodeURIComponent(activeKeyword)}`).then((res) => {
        setProducts(res.data.content || res.data);
        setProductsLoading(false);
      });
    } else if (activeCategoryId) {
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
  }, [activeCategoryId, activeKeyword]);

  const loadInitialData = () => {
    setPageLoading(true);
    setPageError(false);

    Promise.all([
      publicApi.get('/banners/active').catch(() => ({ data: [] })),
      publicApi.get('/categories'),
    ])
      .then(([bannersRes, categoriesRes]) => {
        const banners = bannersRes.data;
        setHeroBanners(banners.filter((b) => b.type === 'HERO'));
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

      <div className="flex gap-2 overflow-x-auto px-4 md:px-8 pt-3 pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_ITEMS.map((item) => (
          <button
            key={item}
            onClick={() => setSearchParams({ keyword: item })}
            className="shrink-0 inline-block bg-gray-100 border border-shop-highlight/15 text-shop-text text-xs font-medium px-2.5 py-1 rounded-full leading-none hover:bg-shop-primary hover:text-white hover:border-shop-primary transition whitespace-nowrap"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">
        {heroBanners.length > 0 && !activeCategoryId && !activeKeyword && (
          <div className="mb-6 -mx-4 md:-mx-6">
            <div className="relative rounded-3xl overflow-hidden h-64 md:h-80">
              <img
                src={heroBanners[currentSlide].imageUrl}
                alt={heroBanners[currentSlide].title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

              {heroBanners.length > 1 && (
                <button
                  onClick={() =>
                    setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)
                  }
                  className="absolute left-0 top-0 bottom-0 w-12 z-10 flex items-center justify-start pl-2 group"
                >
                  <span className="w-7 h-7 rounded-full bg-black/20 group-hover:bg-black/35 flex items-center justify-center text-white text-sm transition">
                    ‹
                  </span>
                </button>
              )}

              <div className="relative h-full flex flex-col justify-between px-6 md:px-12 pt-8 pb-20 max-w-xl">
                <div>
                  <h2 className="font-shop-display text-2xl md:text-4xl font-bold text-white mb-2 leading-tight whitespace-pre-line">
                    {heroBanners[currentSlide].title}
                  </h2>
                  {heroBanners[currentSlide].subtitle && (
                    <p className="text-white/85 text-sm md:text-base whitespace-pre-line">
                      {heroBanners[currentSlide].subtitle}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleBannerClick(heroBanners[currentSlide])}
                  className="bg-[#D4A657] text-white px-4 py-1.5 rounded-full font-semibold text-xs w-fit hover:bg-[#C0954A] transition shadow-sm"
                >
                  {heroBanners[currentSlide].buttonText}
                </button>
              </div>

              {heroBanners.length > 1 && (
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % heroBanners.length)}
                  className="absolute right-0 top-0 bottom-0 w-12 z-10 flex items-center justify-end pr-2 group"
                >
                  <span className="w-7 h-7 rounded-full bg-black/20 group-hover:bg-black/35 flex items-center justify-center text-white text-sm transition">
                    ›
                  </span>
                </button>
              )}

              {heroBanners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {heroBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!activeCategoryId && !activeKeyword && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Link to="/hot-selling" className="relative rounded-2xl overflow-hidden h-32 text-left block">
              <div className="absolute inset-0 bg-shop-highlight/10 flex items-center justify-center text-shop-text/20 text-4xl">
                🔥
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-0 left-0 bg-shop-error text-white text-xs font-bold px-4 py-1.5 rounded-br-xl rounded-tl-2xl">
                HOT SELLING
              </div>
              <div className="relative h-full flex flex-col justify-end p-4">
                <span className="text-white font-shop-display font-bold text-base">Hot Selling</span>
                <span className="text-white/80 text-xs">Most loved this week</span>
              </div>
            </Link>

            <Link to="/newly-added" className="relative rounded-2xl overflow-hidden h-32 text-left block">
              <div className="absolute inset-0 bg-shop-highlight/10 flex items-center justify-center text-shop-text/20 text-4xl">
                ✨
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-0 left-0 bg-shop-primary text-white text-xs font-bold px-4 py-1.5 rounded-br-xl rounded-tl-2xl">
                NEWLY ADDED
              </div>
              <div className="relative h-full flex flex-col justify-end p-4">
                <span className="text-white font-shop-display font-bold text-base">Newly Added</span>
                <span className="text-white/80 text-xs">Fresh stock, just in</span>
              </div>
            </Link>
          </div>
        )}

        {categories.length > 0 && !activeCategoryId && !activeKeyword && (
          <div>
            <ScribbleHeading className="font-shop-display text-xl font-bold text-shop-text mb-4 mt-8 block">
              Shop By Categories
            </ScribbleHeading>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 md:-mx-8 md:px-8">
              {categories.slice(0, 7).map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className="flex flex-col items-center shrink-0 w-[130px]"
                >
                  <div className="bg-shop-card rounded-2xl p-[3px] shadow-sm hover:shadow-md transition w-full">
                    <div
                      className={`w-full aspect-square rounded-[13px] overflow-hidden flex items-center justify-center text-white text-3xl font-bold ${
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

              <Link to="/categories" className="flex flex-col items-center shrink-0 w-[130px]">
                <div className="bg-shop-highlight/10 rounded-2xl shadow-sm hover:shadow-md transition w-full aspect-square flex flex-col items-center justify-center gap-1">
                  <span className="text-shop-primary text-lg">→</span>
                  <span className="text-xs text-shop-primary font-semibold">View all</span>
                </div>
              </Link>
            </div>
          </div>
        )}

        {secondaryBanners.length > 0 && !activeCategoryId && !activeKeyword && (
          <div>
            <ScribbleHeading className="font-shop-display text-xl font-bold text-shop-text mb-4 mt-8 block">
              Handpicked For You
            </ScribbleHeading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>
        )}

        {!activeCategoryId && !activeKeyword && (
          <div className="bg-shop-card rounded-2xl p-6 md:p-8 mb-8 mt-8">
            <div className="text-center mb-6">
              <h2 className="font-shop-display text-xl font-bold text-shop-text mb-1">
                Why Shop With Us
              </h2>
              <p className="text-sm text-shop-highlight">
                Simple shopping. Genuine products. Real service.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
              <div className="text-center">
                <svg className="w-6 h-6 mx-auto mb-2.5 text-shop-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                  <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                </svg>
                <p className="text-xs font-bold text-shop-text mb-1">Fast Delivery</p>
                <p className="text-[10px] text-shop-highlight leading-relaxed">At your door in 15-20 mins.</p>
              </div>

              <div className="text-center">
                <svg className="w-6 h-6 mx-auto mb-2.5 text-shop-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <p className="text-xs font-bold text-shop-text mb-1">Secure Payments</p>
                <p className="text-[10px] text-shop-highlight leading-relaxed">Safe &amp; trusted checkout.</p>
              </div>

              <div className="text-center">
                <svg className="w-6 h-6 mx-auto mb-2.5 text-shop-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                  <path d="M3 9l1-5h16l1 5M4 9v10h16V9M4 9h16M9 21v-6h6v6" />
                </svg>
                <p className="text-xs font-bold text-shop-text mb-1">Easy Pickup</p>
                <p className="text-[10px] text-shop-highlight leading-relaxed">Ready in 10 min, saves time.</p>
              </div>

              <div className="text-center">
                <svg className="w-6 h-6 mx-auto mb-2.5 text-shop-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-bold text-shop-text mb-1">Quality Checked</p>
                <p className="text-[10px] text-shop-highlight leading-relaxed">Checked before it ships.</p>
              </div>

              <div className="text-center">
                <svg className="w-6 h-6 mx-auto mb-2.5 text-shop-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
                <p className="text-xs font-bold text-shop-text mb-1">Here to Help</p>
                <p className="text-[10px] text-shop-highlight leading-relaxed">Questions? Just message us.</p>
              </div>
            </div>

            <div className="border-t border-shop-highlight/10 pt-4 text-center">
              <p className="text-sm text-shop-text/70 italic whitespace-nowrap">
                "We're committed to getting every order right — no mix-ups, no shortcuts."
              </p>
            </div>
          </div>
        )}

        {(activeCategoryId || activeKeyword) && (
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