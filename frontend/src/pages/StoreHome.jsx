import { publicApi } from '../api/axiosInstance';
import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCustomerLocation } from '../utils/locationCheck';
import Header from '../components/Header';
import Modal from '../components/Modal';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import ScribbleHeading from '../components/ScribbleHeading';
import { SkeletonCard } from '../components/Skeleton';
import PopularProductCard from '../components/PopularProductCard';
import NeedIcon from '../components/NeedIcon';

const CATEGORY_COLORS = [
  'bg-shop-primary',
  'bg-shop-accent',
  'bg-shop-deliverable',
  'bg-shop-highlight',
];

const QUICK_ITEMS = ['Pen', 'Pencil', 'Marker', 'Eraser', 'Sharpener', 'Highlighter', 'Notebook', 'Glue'];

const NEED_ACCENTS = ['#16A34A', '#D97706', '#7C3AED', '#2563EB', '#DB2777', '#0891B2'];

const NEED_ICON_MAP = {
  'back to school': 'backpack',
  'exam essentials': 'notepad',
  'office essentials': 'briefcase',
  'art & craft': 'palette',
  'college essentials': 'graduationCap',
  'projects & assignments': 'filePenLine',
  'teacher essentials': 'whiteboard',
  'sports & games': 'ball',
  'writing essentials': 'pen',
  'study essentials': 'bookOpen',
  'gifts & journaling': 'gift',
  'kids & creativity': 'shapes',
  'files & organization': 'folder',
  'printing & paper needs': 'printer',
  'presentation & meetings': 'presentation',
};

function getNeedIcon(title) {
  return NEED_ICON_MAP[title.toLowerCase().trim()] || 'book';
}

function StoreHome() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [serviceable, setServiceable] = useState(null);
  const [heroBanners, setHeroBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [secondaryBanners, setSecondaryBanners] = useState([]);
  const [stripBanner, setStripBanner] = useState(null);
  const [needBanners, setNeedBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [selectedColors, setSelectedColors] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [locationBlockedModal, setLocationBlockedModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(false);
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const [popularProducts, setPopularProducts] = useState([]);
  const popularScrollRef = useRef(null);
  const needScrollRef = useRef(null);

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

  const scrollPopular = (direction) => {
    if (popularScrollRef.current) {
      popularScrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };

  const scrollNeeds = (direction) => {
    if (needScrollRef.current) {
      needScrollRef.current.scrollBy({
        left: direction === 'left' ? -320 : 320,
        behavior: 'smooth',
      });
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

  useEffect(() => {
    publicApi.get('/products/popular').then((res) => setPopularProducts(res.data)).catch(() => {});
  }, []);

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
        setStripBanner(banners.find((b) => b.type === 'STRIP') || null);
        setNeedBanners(banners.filter((b) => b.type === 'NEED'));
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
            <div className="relative rounded-2xl overflow-hidden h-64 md:h-80">
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

        {categories.length > 0 && !activeCategoryId && !activeKeyword && (
          <div>
            <ScribbleHeading className="font-shop-display text-xl font-bold text-shop-text mb-4 mt-0 block">
              Shop By Categories
            </ScribbleHeading>

            <div className="grid grid-cols-3 gap-3 md:hidden">
              {categories.slice(0, 8).map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className="flex flex-col items-center"
                >
                  <div className="w-full">
                    <div
                      className={`w-full aspect-square overflow-hidden flex items-center justify-center text-white text-2xl font-bold ${
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

              <Link to="/categories" className="flex flex-col items-center">
                <div className="bg-shop-highlight/10 rounded-2xl shadow-sm hover:shadow-md transition w-full aspect-square flex flex-col items-center justify-center gap-1">
                  <span className="text-shop-primary text-lg">→</span>
                  <span className="text-xs text-shop-primary font-semibold">View all</span>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex gap-3 overflow-x-auto pb-2 -mx-8 px-8">
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

        {!activeCategoryId && !activeKeyword && (
          <div className="bg-shop-primary/10 rounded-2xl px-3 py-3 flex items-center justify-between gap-1 my-6 -mx-4 md:-mx-6 shadow-md overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex flex-col items-center gap-1.5 shrink-0 min-w-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L4 14h6l-1 8 9-11h-6l1-9z" />
              </svg>
              <span className="text-[8.5px] font-medium text-shop-text text-center whitespace-nowrap">Fast Delivery</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 shrink-0 min-w-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 9V6a1 1 0 011-1h14a1 1 0 011 1v3" />
                <path d="M3 9h18l-1 3a2 2 0 01-2 1.6V20a1 1 0 01-1 1H7a1 1 0 01-1-1v-6.4A2 2 0 014 12z" />
                <path d="M10 21v-5h4v5" />
              </svg>
              <span className="text-[8.5px] font-medium text-shop-text text-center whitespace-nowrap">Store Pickup</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 shrink-0 min-w-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.5l7 3v5.5c0 4.8-3 7.9-7 10.5-4-2.6-7-5.7-7-10.5V5.5z" />
                <path d="M9 12l2.2 2.2L15.5 9.5" />
              </svg>
              <span className="text-[8.5px] font-medium text-shop-text text-center whitespace-nowrap">Secure Pay</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 shrink-0 min-w-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L3.3 8.7l6.1-.6z" />
              </svg>
              <span className="text-[8.5px] font-medium text-shop-text text-center whitespace-nowrap">Quality Checked</span>
            </div>
          </div>
        )}

        {popularProducts.length > 0 && !activeCategoryId && !activeKeyword && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-1">
              <ScribbleHeading variant="alt" className="font-shop-display text-xl font-bold text-shop-text block">
                Popular Right Now
              </ScribbleHeading>
              <Link to="/popular" className="text-sm font-semibold text-shop-primary hover:text-shop-primary-dark transition shrink-0">
                See all →
              </Link>
            </div>
            <p className="text-sm text-shop-highlight mb-4">What people are picking up today</p>

            <div className="relative">
              <button
                onClick={() => scrollPopular('left')}
                className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md items-center justify-center text-shop-text hover:bg-shop-bg transition"
              >
                ‹
              </button>

              <div
                ref={popularScrollRef}
                className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {popularProducts.slice(0, 12).map((product) => (
                  <div key={product.id} className="shrink-0 w-[42%] md:w-[190px] snap-start">
                    <PopularProductCard product={product} />
                  </div>
                ))}
              </div>

              <button
                onClick={() => scrollPopular('right')}
                className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md items-center justify-center text-shop-text hover:bg-shop-bg transition"
              >
                ›
              </button>
            </div>
          </div>
        )}

        {needBanners.length > 0 && !activeCategoryId && !activeKeyword && (
          <div className="mb-8">
            <div>
              <ScribbleHeading variant="alt" className="font-shop-display text-xl font-bold text-shop-text block">
                Shop By Need
              </ScribbleHeading>
              <p className="text-sm text-shop-highlight mt-1">Find everything for what you're working on.</p>
            </div>

            <div className="relative mt-4">
              <button
                onClick={() => scrollNeeds('left')}
                className="hidden md:flex absolute -left-3 top-[40%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md items-center justify-center text-shop-text hover:bg-shop-bg transition"
              >
                ‹
              </button>

              <div
                ref={needScrollRef}
                className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {needBanners.map((need, idx) => {
                  const accent = NEED_ACCENTS[idx % NEED_ACCENTS.length];
                  return (
                    <button
                      key={need.id}
                      onClick={() => handleBannerClick(need)}
                      className="shrink-0 w-[70%] md:w-[260px] h-[280px] md:h-[320px] snap-start text-left bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition group flex flex-col"
                    >
                      <div className="h-40 md:h-48 overflow-hidden shrink-0">
                        <img
                          src={need.imageUrl}
                          alt={need.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${accent}1A` }}
                          >
                            <NeedIcon name={getNeedIcon(need.title)} color={accent} />
                          </span>
                          <h3 className="font-shop-display font-bold text-sm text-shop-text leading-tight line-clamp-2">
                            {need.title}
                          </h3>
                        </div>
                        {need.subtitle && (
                          <p className="text-xs text-shop-highlight leading-relaxed mb-3 line-clamp-2">
                            {need.subtitle}
                          </p>
                        )}
                        <span
                          className="text-xs font-semibold inline-flex items-center gap-1 mt-auto"
                          style={{ color: accent }}
                        >
                          {need.buttonText || 'Shop now'} →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => scrollNeeds('right')}
                className="hidden md:flex absolute -right-3 top-[40%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md items-center justify-center text-shop-text hover:bg-shop-bg transition"
              >
                ›
              </button>
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