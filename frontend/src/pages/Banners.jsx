import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    buttonText: "SHOP NOW",
    categoryId: "",
    active: true,
    type: "SECONDARY"
  });

  const loadBanners = () => {
    axiosInstance
      .get("/banners")
      .then((res) => setBanners(res.data))
      .catch(() => setError("Failed to load banners"));
  };

  useEffect(() => {
    loadBanners();
    axiosInstance.get("/categories").then((res) => setCategories(res.data));
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      title: "",
      subtitle: "",
      imageUrl: "",
      buttonText: "SHOP NOW",
      categoryId: "",
      active: true,
      type: "SECONDARY"
    });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl,
      buttonText: banner.buttonText,
      categoryId: banner.category?.id || "",
      active: banner.active,
      type: banner.type || "SECONDARY"
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      subtitle: form.subtitle,
      imageUrl: form.imageUrl,
      buttonText: form.buttonText,
      category: form.categoryId ? { id: parseInt(form.categoryId) } : null,
      active: form.active,
      type: form.type
    };
    try {
      if (editingId) {
        await axiosInstance.put(`/banners/${editingId}`, payload);
      } else {
        await axiosInstance.post("/banners", payload);
      }
      setModalOpen(false);
      loadBanners();
    } catch {
      setError("Failed to save banner");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/banners/${deleteId}`);
      setDeleteId(null);
      loadBanners();
    } catch {
      setError("Failed to delete banner");
    }
  };

  const toggleActive = async (banner) => {
    try {
      await axiosInstance.put(`/banners/${banner.id}`, {
        title: banner.title,
        subtitle: banner.subtitle,
        imageUrl: banner.imageUrl,
        buttonText: banner.buttonText,
        category: banner.category ? { id: banner.category.id } : null,
        active: !banner.active,
      });
      loadBanners();
    } catch {
      setError("Failed to update banner");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Banners</h1>
        <button
          onClick={openCreateModal}
          className="bg-brass hover:bg-brass-dark text-white px-4 py-2 rounded-sm text-sm transition"
        >
          + Add Banner
        </button>
      </div>

      {error && (
        <div className="bg-stamp/10 text-stamp p-3 rounded-sm mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-sm border border-ledger-line overflow-hidden">
            <img src={banner.imageUrl} alt={banner.title} className="w-full h-32 object-cover" />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-ink text-sm">{banner.title}</p>
                  <p className="text-slate-text text-xs">{banner.subtitle}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    banner.active ? "bg-sage/15 text-sage" : "bg-slate-text/15 text-slate-text"
                  }`}
                >
                  {banner.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-slate-text mb-3">
                Links to: {banner.category?.name || "No category"}
              </p>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => openEditModal(banner)}
                  className="text-brass-dark hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(banner)}
                  className="text-slate-text hover:underline"
                >
                  {banner.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setDeleteId(banner.id)}
                  className="text-stamp hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Banner" : "Add Banner"}
      >
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-ink mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
            required
          />

          <label className="block text-sm font-medium text-ink mb-1">Subtitle</label>
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
          />

          <label className="block text-sm font-medium text-ink mb-1">Image URL</label>
          <input
            type="text"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
            placeholder="https://..."
            required
          />

          <label className="block text-sm font-medium text-ink mb-1">Button Text</label>
          <input
            type="text"
            value={form.buttonText}
            onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
            required
          />
          <label className="block text-sm font-medium text-ink mb-1">Banner Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
          >
            <option value="HERO">Hero (large top banner)</option>
            <option value="SECONDARY">Secondary (small promo card)</option>
          </select>

          <label className="block text-sm font-medium text-ink mb-1">Links to Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
          >
            <option value="">-- None --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 mb-6 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active (visible on storefront)
          </label>

          <button
            type="submit"
            className="w-full bg-brass hover:bg-brass-dark text-white py-2 rounded-sm text-sm transition"
          >
            Save Banner
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Delete this banner? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Layout>
  );
}