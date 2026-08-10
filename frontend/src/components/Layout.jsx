import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const NOTIFIED_KEY = "dxt_notified_order_ids";

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [newOrderPopup, setNewOrderPopup] = useState(null);
  const notifiedIdsRef = useRef(
    new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || "[]"))
  );
  const buzzerIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const playSingleBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.25);
    } catch {
      // Ignore if audio isn't available
    }
  };

  const startBuzzer = () => {
    stopBuzzer();
    playSingleBeep();
    buzzerIntervalRef.current = setInterval(playSingleBeep, 1200);
  };

  const stopBuzzer = () => {
    if (buzzerIntervalRef.current) {
      clearInterval(buzzerIntervalRef.current);
      buzzerIntervalRef.current = null;
    }
  };

  useEffect(() => {
    const poll = () => {
      axiosInstance
        .get("/orders")
        .then((res) => {
          const relevant = res.data.filter(
            (o) => o.status !== "PENDING" && o.status !== "CANCELLED"
          );
          const unnotified = relevant.filter((o) => !notifiedIdsRef.current.has(o.id));

          if (unnotified.length > 0) {
            unnotified.forEach((o) => notifiedIdsRef.current.add(o.id));
            localStorage.setItem(
              NOTIFIED_KEY,
              JSON.stringify(Array.from(notifiedIdsRef.current))
            );
            setNewOrderPopup(unnotified[0]);
            startBuzzer();
          }
        })
        .catch(() => {});
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => {
      clearInterval(interval);
      stopBuzzer();
    };
  }, []);

  const handleDismiss = () => {
    stopBuzzer();
    setNewOrderPopup(null);
  };

  const handleViewOrder = () => {
    stopBuzzer();
    setNewOrderPopup(null);
    navigate("/admin/orders");
  };

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/categories", label: "Categories" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/suppliers", label: "Suppliers" },
    { to: "/admin/purchases", label: "Purchases" },
    { to: "/admin/sales", label: "Sales" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/staff", label: "Staff" },
    { to: "/admin/banners", label: "Banners" },
  ];

  return (
    <div className="flex min-h-screen bg-ledger font-sans">
      <aside className="w-64 bg-ink text-ledger flex flex-col">
        <div className="p-6 border-b border-brass/30">
          <p className="font-display text-2xl font-semibold tracking-tight">
            STUDENT ENTERPRISES
          </p>
          <p className="text-xs text-accent mt-1 tracking-wide uppercase">
            Ledger &amp; Stock
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-sm text-sm tracking-wide transition border-l-2 ${
                  isActive
                    ? "bg-white/5 text-white border-brass"
                    : "text-ledger/60 border-transparent hover:bg-white/5 hover:text-ledger"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-brass/30">
          <button
            onClick={handleLogout}
            className="w-full bg-transparent border border-brass/50 hover:bg-brass hover:text-ink hover:border-brass text-brass py-2 rounded-sm text-sm tracking-wide transition"
          >
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto text-ink">{children}</main>

      {newOrderPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 border-4 border-brass animate-pulse">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass-dark mb-1">
              🔔 New Order
            </p>
            <h2 className="text-xl font-bold text-ink mb-3">
              Order #{newOrderPopup.id}
            </h2>
            <p className="text-sm text-slate-text mb-1">
              {newOrderPopup.customerName} — {newOrderPopup.phone}
            </p>
            <p className="text-sm text-slate-text mb-3">
              {newOrderPopup.shippingAddress}
            </p>
            <div className="border-t border-ledger-line pt-3 mb-4 space-y-1">
              {newOrderPopup.items?.map((item, idx) => (
                <p key={idx} className="text-sm text-ink">
                  {item.productName}
                  {item.colorName && (
                    <span className="text-brass-dark"> ({item.colorName})</span>
                  )}
                  {' '}× {item.quantity}
                </p>
              ))}
            </div>
            <p className="font-mono font-bold text-lg text-ink mb-4">
              ₹{newOrderPopup.totalAmount?.toFixed(2)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 border border-ledger-line text-ink py-2 rounded-sm text-sm hover:border-brass transition"
              >
                Dismiss
              </button>
              <button
                onClick={handleViewOrder}
                className="flex-1 bg-brass hover:bg-brass-dark text-white py-2 rounded-sm text-sm transition"
              >
                View Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}