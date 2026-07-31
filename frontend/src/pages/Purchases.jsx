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
        <h1 className="text-2xl font-bold text-slate-800">Purchases</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          + Record Purchase
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-3">{p.productName}</td>
                <td className="p-3">{p.supplierName}</td>
                <td className="p-3">{p.quantityPurchased}</td>
                <td className="p-3">₹{p.totalCost.toFixed(2)}</td>
                <td className="p-3 text-slate-500">
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
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Product
          </label>
          <select
            value={form.productId}
            onChange={(e) =>
              setForm({ ...form, productId: e.target.value })
            }
            className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4"
            required
          >
            <option value="">-- Select --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Supplier
          </label>
          <select
            value={form.supplierId}
            onChange={(e) =>
              setForm({ ...form, supplierId: e.target.value })
            }
            className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4"
            required
          >
            <option value="">-- Select --</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Quantity Purchased
          </label>
          <input
            type="number"
            value={form.quantityPurchased}
            onChange={(e) =>
              setForm({ ...form, quantityPurchased: e.target.value })
            }
            className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4"
            required
          />
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Total Cost
          </label>
          <input
            type="number"
            step="0.01"
            value={form.totalCost}
            onChange={(e) =>
              setForm({ ...form, totalCost: e.target.value })
            }
            className="w-full border border-slate-300 rounded-md px-3 py-2 mb-6"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Record Purchase
          </button>
        </form>
      </Modal>
    </Layout>
  );
}