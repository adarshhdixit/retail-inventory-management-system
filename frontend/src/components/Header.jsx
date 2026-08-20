import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance, { publicApi } from '../api/axiosInstance';
import AccountMenu from './AccountMenu';
import { useCart } from '../context/CartContext';

const SEARCH_PLACEHOLDERS = ['pens', 'notebooks', 'lunchbox', 'colors', 'staplers'];

export default function Header() {
  const isLoggedIn = !!localStorage.getItem('token');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressOpen, setAddressOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [cartBounce, setCartBounce] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [fulfillmentMode, setFulfillmentMode] = useState('delivery');
  const { cartItems } = useCart();
  const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const prevCountRef = useRef(totalItemsInCart);
  const categoriesRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn) {
      axiosInstance
        .get('/addresses')
        .then((res) => {
          setAddresses(res.data);
          const def = res.data.find((a) => a.isDefault) || res.data[0];
          if (def) setSelectedAddress(def);
        })
        .catch(() => {});
    }
  }, [isLoggedIn]);

  useEffect(() => {
    publicApi.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (totalItemsInCart > prevCountRef.current) {
      setCartBounce(true);
      const timeout = setTimeout(() => setCartBounce(false), 400);
      return () => clearTimeout(timeout);
    }
    prevCountRef.current = totalItemsInCart;
  }, [totalItemsInCart]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setCategoriesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-shop-card border-b border-shop-highlight/10 px-6 py-5 sticky top-0 z-30">
      {/* Mobile header */}
      <div className="md:hidden flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Link to="/store" className="shrink-0">
            <span
              className="text-lg font-bold whitespace-nowrap"
              style={{ fontFamily: 'var(--font-shop-logo)', color: '#81BFBC' }}
            >
              DXT
            </span>
          </Link>

          <div className="relative flex-1 min-w-0 ml-3">
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  window.location.href = '/account';
                  return;
                }
                setAddressOpen(!addressOpen);
              }}
              className="flex flex-col items-start w-full text-left"
            >
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-shop-primary font-semibold flex items-center gap-0.5">
                  Delivering in 15-20 mins
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                  </svg>
                </span>
                <svg className="w-3 h-3 text-shop-highlight shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-shop-text truncate">
                {selectedAddress ? selectedAddress.label : 'Select delivery address'}
              </span>
            </button>

            {addressOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-shop-highlight/10 z-20 py-1">
                {addresses.length === 0 ? (
                  <Link to="/addresses" className="block px-4 py-2 text-sm text-shop-primary hover:bg-shop-bg" onClick={() => setAddressOpen(false)}>
                    + Add an address
                  </Link>
                ) : (
                  addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setAddressOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-shop-text hover:bg-shop-bg"
                    >
                      <p className="font-medium">{addr.label}</p>
                      <p className="text-xs text-shop-highlight truncate">{addr.streetName}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="shrink-0">
            <AccountMenu />
          </div>
        </div>

        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={`Search "${SEARCH_PLACEHOLDERS[placeholderIndex]}"`}
          className="w-full bg-shop-bg border border-shop-highlight/20 rounded-full px-4 py-2.5 text-sm text-shop-text placeholder-shop-highlight/50 focus:outline-none focus:border-shop-primary transition"
        />
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        <Link to="/store" className="flex items-center mr-2 shrink-0">
          <span
            className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent"
            style={{
              fontFamily: 'var(--font-shop-logo)',
              backgroundImage: 'linear-gradient(135deg, #81BFBC 0%, #C9D5C3 100%)',
            }}
          >
            DXT
          </span>
        </Link>

        <div className="relative shrink-0" ref={categoriesRef}>
          <button
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="flex items-center gap-1.5 text-sm text-shop-text border border-shop-highlight/20 rounded-full px-3 py-1.5 hover:border-shop-primary transition"
          >
            <svg className="w-4 h-4 text-shop-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span>Categories</span>
            <svg className="w-3 h-3 text-shop-highlight" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {categoriesOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-shop-highlight/10 z-20 py-1 max-h-72 overflow-y-auto">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/?category=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`}
                  onClick={() => setCategoriesOpen(false)}
                  className="block px-4 py-2 text-sm text-shop-text hover:bg-shop-bg"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-[140px]">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={`Search "${SEARCH_PLACEHOLDERS[placeholderIndex]}"`}
            className="w-full bg-shop-bg border border-transparent rounded-full px-4 py-2 text-sm text-shop-text placeholder-shop-highlight/50 focus:outline-none focus:border-shop-primary transition"
          />
        </div>

        <div className="flex items-center bg-shop-bg rounded-full border border-shop-highlight/20 overflow-hidden shrink-0">
          <button
            onClick={() => setFulfillmentMode('delivery')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition ${
              fulfillmentMode === 'delivery' ? 'bg-shop-primary text-white' : 'text-shop-highlight'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="5.5" cy="17.5" r="2.5" />
              <circle cx="18.5" cy="17.5" r="2.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 6a1 1 0 011-1h1l3 5v5h-2M15 6H4l4 6h7M15 6v6" />
            </svg>
            Delivery
          </button>
          <button
            onClick={() => setFulfillmentMode('pickup')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition ${
              fulfillmentMode === 'pickup' ? 'bg-shop-primary text-white' : 'text-shop-highlight'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1-5h16l1 5M4 9v10h16V9M4 9h16M9 21v-6h6v6" />
            </svg>
            Pickup
          </button>
        </div>

        <div className="hidden md:flex flex-col shrink-0 px-3 py-1 rounded-lg bg-shop-primary/10">
          <span className="text-[10px] text-shop-text font-semibold">
            {fulfillmentMode === 'delivery' ? (selectedAddress?.label || 'Home') : 'Student Enterprises'}
          </span>
          <span className="text-[10px] text-shop-primary-dark font-bold">
            {fulfillmentMode === 'delivery' ? '15-20 min delivery' : 'Ready in 10 min'}
          </span>
        </div>

        {isLoggedIn && fulfillmentMode === 'delivery' && (
          <div className="relative shrink-0">
            <button
              onClick={() => setAddressOpen(!addressOpen)}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-shop-highlight/20 hover:border-shop-primary transition"
              aria-label="Change location"
            >
              <svg className="w-4 h-4 text-shop-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {addressOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-shop-highlight/10 z-20 py-1">
                {addresses.length === 0 ? (
                  <Link
                    to="/addresses"
                    className="block px-4 py-2 text-sm text-shop-primary hover:bg-shop-bg"
                    onClick={() => setAddressOpen(false)}
                  >
                    + Add an address
                  </Link>
                ) : (
                  addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setAddressOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-shop-text hover:bg-shop-bg"
                    >
                      <p className="font-medium">{addr.label}</p>
                      <p className="text-xs text-shop-highlight truncate">{addr.streetName}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <div className="shrink-0">
          <AccountMenu />
        </div>

        <Link
          to="/cart"
          className={`relative shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-shop-highlight/20 hover:border-shop-primary transition text-shop-text ${
            cartBounce ? 'animate-bounce' : ''
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {totalItemsInCart > 0 && (
            <span className="absolute -top-1 -right-1 bg-shop-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-shop-card">
              {totalItemsInCart}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}