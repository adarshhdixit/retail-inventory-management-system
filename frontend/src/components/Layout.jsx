import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
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
    </div>
  );
}