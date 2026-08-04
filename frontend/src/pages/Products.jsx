import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    categoryId: "",
    supplierId: "",
  });
  const [deleteId, setDeleteId] = useState(null);

  const loadProducts = () => {
    const url = search
      ? `/products/search?keyword=${search}&page=${page}&size=10`
      : `/products?page=${page}&size=10`;
    axiosInstance
      .get(url)
      .then((res) => {
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => setError("Failed to load products"));
  };

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  useEffect(() => {
    axiosInstance.get("/categories").then((res) => setCategories(res.data));
    axiosInstance.get("/suppliers").then((res) => setSuppliers(res.data));
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      price: "",
      quantity: "",
      categoryId: "",
      supplierId: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      quantity: p.quantity,
      categoryId: "",
      supplierId: "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      category: form.categoryId ? { id: parseInt(form.categoryId) } : null,
      supplier: form.supplierId ? { id: parseInt(form.supplierId) } : null,
    };
    try {
      if (editingId) {
        await axiosInstance.put(`/products/${editingId}`, payload);
      } else {
        await axiosInstance.post("/products", payload);
      }
      setModalOpen(false);
      loadProducts();
    } catch {
      setError("Failed to save product");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/products/${deleteId}`);
      setDeleteId(null);
      loadProducts();
    } catch {
      setError("Failed to delete product");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Products</h1>
        <button
          onClick={openCreateModal}
          className="bg-brass hover:bg-brass-dark text-white px-4 py-2 rounded-sm text-sm transition"
        >
          + Add Product
        </button>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        className="w-full max-w-sm border border-ledger-line bg-white rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
      />

      {error && (
        <div className="bg-stamp/10 text-stamp p-3 rounded-sm mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-sm border border-ledger-line overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-ledger text-ink text-xs uppercase tracking-wide">
            <tr>
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Category</th>
              <th className="p-3 font-semibold">Supplier</th>
              <th className="p-3 font-semibold">Price</th>
              <th className="p-3 font-semibold">Quantity</th>
              <th className="p-3 font-semibold w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-ledger-line">
                <td className="p-3 text-ink text-sm">{p.name}</td>
                <td className="p-3 text-slate-text text-sm">{p.categoryName}</td>
                <td className="p-3 text-slate-text text-sm">{p.supplierName}</td>
                <td className="p-3 font-mono text-sm text-ink">₹{p.price}</td>
                <td
                  className={`p-3 font-mono text-sm ${
                    p.quantity < 10 ? "text-stamp font-semibold" : "text-ink"
                  }`}
                >
                  {p.quantity}
                </td>
                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => openEditModal(p)}
                    className="text-brass-dark hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="text-stamp hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-3 mt-5">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 rounded-sm border border-ledger-line text-sm text-ink disabled:opacity-40 hover:border-brass transition"
        >
          Prev
        </button>
        <span className="text-slate-text text-sm">
          Page {page + 1} of {totalPages || 1}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 rounded-sm border border-ledger-line text-sm text-ink disabled:opacity-40 hover:border-brass transition"
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Product" : "Add Product"}
      >
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-ink mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
            required
          />
          <label className="block text-sm font-medium text-ink mb-1">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
          />
          <label className="block text-sm font-medium text-ink mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
            required
          />
          <label className="block text-sm font-medium text-ink mb-1">Quantity</label>
          <input
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
            required
          />
          <label className="block text-sm font-medium text-ink mb-1">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
          >
            <option value="">-- Select --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium text-ink mb-1">Supplier</label>
          <select
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-6 text-sm focus:outline-none focus:border-brass"
          >
            <option value="">-- Select --</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full bg-brass hover:bg-brass-dark text-white py-2 rounded-sm text-sm transition"
          >
            Save
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Are you sure you want to delete this product?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Layout>
  );
}