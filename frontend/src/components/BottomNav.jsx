import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const NAV_ITEMS = [
  {
    key: 'home',
    label: 'Home',
    path: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
      </svg>
    ),
  },
  {
    key: 'categories',
    label: 'Categories',
    path: '/categories',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    key: 'orders',
    label: 'My Orders',
    path: '/my-orders',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2h6l1 4H8l1-4z" />
        <path d="M4 6h16v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        <path d="M9 12h6M9 16h6" />
      </svg>
    ),
  },
  {
      key: 'chat',
      label: 'Chat',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      ),
    },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute) {
      document.body.classList.remove('has-bottom-nav');
    } else {
      document.body.classList.add('has-bottom-nav');
    }
    return () => document.body.classList.remove('has-bottom-nav');
  }, [isAdminRoute]);

  if (isAdminRoute) return null;

  const handleTabClick = (item) => {
    if (item.key === 'chat') {
      window.open(
        'https://wa.me/917389806555?text=' +
          encodeURIComponent('Hi! I have a question about my order/products from DXT.'),
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }
    navigate(item.path);
  };

  const isActive = (item) => {
    if (item.key === 'chat') return false;
    if (item.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90]">
      {totalItems > 0 && (
        <div className="flex justify-center pb-1.5">
          <Link
            to="/cart"
            className="bg-shop-primary rounded-full px-5 py-2.5 flex items-center gap-2 shadow-xl"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className="text-xs text-white font-medium">Cart</span>
            <span className="bg-white text-shop-primary-dark text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </Link>
        </div>
      )}

      <div className="bg-shop-card border-t border-shop-highlight/10 py-2 flex">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => handleTabClick(item)}
            className={`flex-1 min-w-0 flex flex-col items-center gap-1 ${
              isActive(item) ? 'text-shop-primary' : 'text-shop-highlight'
            }`}
          >
            {item.icon}
            <span className="text-[10.5px]">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}