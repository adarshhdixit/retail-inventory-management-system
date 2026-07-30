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
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
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
        className="w-full max-w-sm border border-slate-300 rounded-md px-3 py-2 mb-4"
      />

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Price</th>
              <th className="p-3">Quantity</th>
              <th className="p-3 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-slate-500">{p.categoryName}</td>
                <td className="p-3 text-slate-500">{p.supplierName}</td>
                <td className="p-3">₹{p.price}</td>
                <td
                  className={`p-3 ${
                    p.quantity < 10 ? "text-red-600 font-semibold" : ""
                  }`}
                >
                  {p.quantity}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => openEditModal(p)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 rounded-md bg-slate-200 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1 text-slate-600">
          Page {page + 1} of {totalPages || 1}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 rounded-md bg-slate-200 disabled:opacity-50"
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
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4"
            required
          />
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Description
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4"
          />
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Price
          </label>
          <input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4"
            required
          />
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Quantity
          </label>
          <input
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4"
            required
          />
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Category
          </label>
          <select
            value={form.categoryId}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value })
            }
            className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4"
          >
            <option value="">-- Select --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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
            className="w-full border border-slate-300 rounded-md px-3 py-2 mb-6"
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
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
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