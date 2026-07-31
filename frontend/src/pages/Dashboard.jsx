import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/dashboard")
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load dashboard stats"));
  }, []);

  const cards = stats
    ? [
        { label: "Total Products", value: stats.totalProducts },
        { label: "Total Categories", value: stats.totalCategories },
        { label: "Total Suppliers", value: stats.totalSuppliers },
        { label: "Total Sales", value: stats.totalSales },
        { label: "Total Purchases", value: stats.totalPurchases },
        { label: "Total Revenue", value: `₹${stats.totalRevenue.toFixed(2)}` },
        { label: "Low Stock Products", value: stats.lowStockProductCount },
      ]
    : [];

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm p-5 border border-slate-100"
          >
            <p className="text-slate-500 text-sm">{card.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
}