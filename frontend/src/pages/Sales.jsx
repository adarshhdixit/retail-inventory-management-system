import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Layout from "../components/Layout";
import Modal from "../components/Modal";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ productId: "", quantitySold: "" });

  const loadSales = () => {
    axiosInstance
      .get("/sales")
      .then((res) => setSales(res.data))
      .catch(() => setError("Failed to load sales"));
  };

  useEffect(() => {
    loadSales();
    axiosInstance.get("/products?size=100").then((res) =>
      setProducts(res.data.content)
    );
  }, []);

  const openCreateModal = () => {
    setForm({ productId: "", quantitySold: "" });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/sales", {
        product: { id: parseInt(form.productId) },
        quantitySold: parseInt(form.quantitySold),
      });
      setModalOpen(false);
      loadSales();
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to record sale (check stock)"
      );
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Sales</h1>
        <button
          onClick={openCreateModal}
          className="bg-brass hover:bg-brass-dark text-white px-4 py-2 rounded-sm text-sm transition"
        >
          + Record Sale
        </button>
      </div>

      <div className="bg-white rounded-sm border border-ledger-line overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-ledger text-ink text-xs uppercase tracking-wide">
            <tr>
              <th className="p-3 font-semibold">Product</th>
              <th className="p-3 font-semibold">Quantity Sold</th>
              <th className="p-3 font-semibold">Total Amount</th>
              <th className="p-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-t border-ledger-line">
                <td className="p-3 text-ink text-sm">{s.productName}</td>
                <td className="p-3 font-mono text-sm text-ink">{s.quantitySold}</td>
                <td className="p-3 font-mono text-sm text-sage font-semibold">
                  ₹{s.totalAmount.toFixed(2)}
                </td>
                <td className="p-3 text-slate-text text-sm">
                  {new Date(s.saleDate).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Sale"
      >
        {error && (
          <div className="bg-stamp/10 text-stamp p-3 rounded-sm mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-ink mb-1">Product</label>
          <select
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
            required
          >
            <option value="">-- Select --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Stock: {p.quantity})
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium text-ink mb-1">Quantity Sold</label>
          <input
            type="number"
            value={form.quantitySold}
            onChange={(e) => setForm({ ...form, quantitySold: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-6 text-sm focus:outline-none focus:border-brass"
            required
          />
          <button
            type="submit"
            className="w-full bg-brass hover:bg-brass-dark text-white py-2 rounded-sm text-sm transition"
          >
            Record Sale
          </button>
        </form>
      </Modal>
    </Layout>
  );
}