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
        <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          + Add Category
        </button>
      </div>

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
              <th className="p-3">Description</th>
              <th className="p-3 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t border-slate-100">
                <td className="p-3">{cat.name}</td>
                <td className="p-3 text-slate-500">{cat.description}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(cat.id)}
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Category" : "Add Category"}
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
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full border border-slate-300 rounded-md px-3 py-2 mb-6"
          />
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
        message="Are you sure you want to delete this category?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Layout>
  );
}