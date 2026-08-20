import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) return null;

  return (
    <footer className="bg-shop-text px-6 md:px-10 pt-10 pb-6 mt-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-shop-logo)', color: '#81BFBC' }}
            >
              DXT
            </span>
            <p className="text-xs text-white/55 leading-relaxed mt-2 max-w-[220px]">
              Everything for your desk, delivered to your door in 15-20 minutes — or pick it up yourself.
            </p>
            <div className="flex gap-2 mt-4">
            <a href="https://wa.me/917389806555" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm transition">💬</a>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-white tracking-wide mb-3">SHOP</p>
            <div className="flex flex-col gap-2 text-xs text-white/65">
              <Link to="/categories" className="hover:text-white transition">All Categories</Link>
              <Link to="/hot-selling" className="hover:text-white transition">Hot Selling</Link>
              <Link to="/newly-added" className="hover:text-white transition">Newly Added</Link>
              <Link to="/my-orders" className="hover:text-white transition">Track Your Order</Link>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-white tracking-wide mb-3">MY ACCOUNT</p>
            <div className="flex flex-col gap-2 text-xs text-white/65">
              <Link to="/my-orders" className="hover:text-white transition">My Orders</Link>
              <Link to="/addresses" className="hover:text-white transition">My Addresses</Link>
              <Link to="/cart" className="hover:text-white transition">My Cart</Link>
              <Link to="/account" className="hover:text-white transition">Login</Link>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-white tracking-wide mb-3">VISIT US</p>
            <div className="text-xs text-white/65 leading-relaxed space-y-2">
              <p>Gandhi chowk, Dindori</p>
              <p>🕐 Mon – Sun, 9:00 AM – 9:00 PM</p>
              <p>📞 +91 73898 06555</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] text-white/40">Secure payments powered by</span>
          <div className="flex gap-2 items-center flex-wrap">
            {['UPI', 'VISA', 'Mastercard', 'Razorpay'].map((p) => (
              <span key={p} className="bg-white rounded text-shop-text text-[9px] font-bold px-2.5 py-1">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] text-white/40">
            © {new Date().getFullYear()} DXT — Student Enterprises. All rights reserved.
          </span>
          <div className="flex gap-4">
            <Link to="/terms" className="text-[10px] text-white/50 hover:text-white transition">Terms of Service</Link>
            <Link to="/privacy" className="text-[10px] text-white/50 hover:text-white transition">Privacy Policy</Link>
            <Link to="/refund-policy" className="text-[10px] text-white/50 hover:text-white transition">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}