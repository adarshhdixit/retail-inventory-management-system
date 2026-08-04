import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [deleteId, setDeleteId] = useState(null);

  const loadCategories = () => {
    axiosInstance
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setError("Failed to load categories"));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: "", description: "" });
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/categories/${editingId}`, form);
      } else {
        await axiosInstance.post("/categories", form);
      }
      setModalOpen(false);
      loadCategories();
    } catch {
      setError("Failed to save category");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/categories/${deleteId}`);
      setDeleteId(null);
      loadCategories();
    } catch {
      setError("Failed to delete category");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Categories</h1>
        <button
          onClick={openCreateModal}
          className="bg-brass hover:bg-brass-dark text-white px-4 py-2 rounded-sm text-sm transition"
        >
          + Add Category
        </button>
      </div>

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
              <th className="p-3 font-semibold">Description</th>
              <th className="p-3 font-semibold w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t border-ledger-line">
                <td className="p-3 text-ink text-sm">{cat.name}</td>
                <td className="p-3 text-slate-text text-sm">{cat.description}</td>
                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="text-brass-dark hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(cat.id)}
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Category" : "Add Category"}
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
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-6 text-sm focus:outline-none focus:border-brass"
          />
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
        message="Are you sure you want to delete this category?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Layout>
  );
}