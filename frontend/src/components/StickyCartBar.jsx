import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function StickyCartBar() {
  const { cartItems, cartTotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const hiddenOnRoutes = ['/cart', '/checkout'];
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (totalItems === 0 || hiddenOnRoutes.includes(location.pathname) || isAdminRoute) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/cart')}
      className="fixed bottom-0 left-0 right-0 z-[95] bg-shop-text text-white px-5 py-3.5 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.15)] md:hidden"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="absolute -top-2 -right-2 bg-shop-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        </div>
        <span className="text-sm font-semibold">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono font-bold">₹{cartTotal.toFixed(2)}</span>
        <span className="text-xs font-semibold bg-white/15 px-3 py-1.5 rounded-full">
          View Cart →
        </span>
      </div>
    </button>
  );
}