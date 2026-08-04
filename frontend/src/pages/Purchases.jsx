import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Layout from "../components/Layout";
import Modal from "../components/Modal";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    supplierId: "",
    quantityPurchased: "",
    totalCost: "",
  });

  const loadPurchases = () => {
    axiosInstance
      .get("/purchases")
      .then((res) => setPurchases(res.data))
      .catch(() => setError("Failed to load purchases"));
  };

  useEffect(() => {
    loadPurchases();
    axiosInstance.get("/products?size=100").then((res) =>
      setProducts(res.data.content)
    );
    axiosInstance.get("/suppliers").then((res) => setSuppliers(res.data));
  }, []);

  const openCreateModal = () => {
    setForm({
      productId: "",
      supplierId: "",
      quantityPurchased: "",
      totalCost: "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/purchases", {
        product: { id: parseInt(form.productId) },
        supplier: { id: parseInt(form.supplierId) },
        quantityPurchased: parseInt(form.quantityPurchased),
        totalCost: parseFloat(form.totalCost),
      });
      setModalOpen(false);
      loadPurchases();
    } catch {
      setError("Failed to record purchase");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Purchases</h1>
        <button
          onClick={openCreateModal}
          className="bg-brass hover:bg-brass-dark text-white px-4 py-2 rounded-sm text-sm transition"
        >
          + Record Purchase
        </button>
      </div>

      <div className="bg-white rounded-sm border border-ledger-line overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-ledger text-ink text-xs uppercase tracking-wide">
            <tr>
              <th className="p-3 font-semibold">Product</th>
              <th className="p-3 font-semibold">Supplier</th>
              <th className="p-3 font-semibold">Quantity</th>
              <th className="p-3 font-semibold">Cost</th>
              <th className="p-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="border-t border-ledger-line">
                <td className="p-3 text-ink text-sm">{p.productName}</td>
                <td className="p-3 text-slate-text text-sm">{p.supplierName}</td>
                <td className="p-3 font-mono text-sm text-ink">{p.quantityPurchased}</td>
                <td className="p-3 font-mono text-sm text-ink">₹{p.totalCost.toFixed(2)}</td>
                <td className="p-3 text-slate-text text-sm">
                  {new Date(p.purchaseDate).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Purchase"
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
                {p.name}
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium text-ink mb-1">Supplier</label>
          <select
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
            required
          >
            <option value="">-- Select --</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium text-ink mb-1">Quantity Purchased</label>
          <input
            type="number"
            value={form.quantityPurchased}
            onChange={(e) => setForm({ ...form, quantityPurchased: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
            required
          />
          <label className="block text-sm font-medium text-ink mb-1">Total Cost</label>
          <input
            type="number"
            step="0.01"
            value={form.totalCost}
            onChange={(e) => setForm({ ...form, totalCost: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-6 text-sm focus:outline-none focus:border-brass"
            required
          />
          <button
            type="submit"
            className="w-full bg-brass hover:bg-brass-dark text-white py-2 rounded-sm text-sm transition"
          >
            Record Purchase
          </button>
        </form>
      </Modal>
    </Layout>
  );
}