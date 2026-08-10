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
  const [categoryFilter, setCategoryFilter] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
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
    subCategory: "",
    deliverable: true,
  });
  const [deleteId, setDeleteId] = useState(null);

  const [variants, setVariants] = useState([]);
  const [newVariantColor, setNewVariantColor] = useState("");
  const [newVariantQty, setNewVariantQty] = useState("");

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const [bulkPricePercent, setBulkPricePercent] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadProducts = () => {
    const sortParam = `&sort=${sortField},${sortDir}`;
    let url;

    if (search) {
      url = `/products/search?keyword=${search}&page=${page}&size=10${sortParam}`;
    } else if (lowStockOnly) {
      url = `/products/low-stock?threshold=10&page=${page}&size=10${sortParam}`;
    } else if (categoryFilter) {
      url = `/products/by-category/${categoryFilter}?page=${page}&size=10${sortParam}`;
    } else {
      url = `/products?page=${page}&size=10${sortParam}`;
    }

    axiosInstance
      .get(url)
      .then((res) => {
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
        setSelectedIds(new Set());
      })
      .catch(() => setError("Failed to load products"));
  };

  useEffect(() => {
    loadProducts();
  }, [page, search, categoryFilter, lowStockOnly, sortField, sortDir]);

  useEffect(() => {
    axiosInstance.get("/categories").then((res) => setCategories(res.data));
    axiosInstance.get("/suppliers").then((res) => setSuppliers(res.data));
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(0);
  };

  const sortIndicator = (field) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      price: "",
      quantity: "",
      categoryId: "",
      supplierId: "",
      subCategory: "",
      deliverable: true,
    });
    setVariants([]);
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      quantity: p.quantity,
      categoryId: p.categoryId || "",
      supplierId: p.supplierId || "",
      subCategory: p.subCategory || "",
      deliverable: p.deliverable !== false,
    });
    setVariants(p.variants || []);
    setModalOpen(true);
  };

  const openDuplicateModal = (p) => {
    setEditingId(null);
    setForm({
      name: `${p.name} (Copy)`,
      description: p.description || "",
      price: p.price,
      quantity: p.quantity,
      categoryId: p.categoryId || "",
      supplierId: p.supplierId || "",
      subCategory: p.subCategory || "",
    });
    setVariants([]);
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
      subCategory: form.subCategory || null,
      deliverable: form.deliverable,
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

  const handleAddVariant = async () => {
    if (!newVariantColor.trim() || !newVariantQty) return;
    try {
      const res = await axiosInstance.post(
        `/products/${editingId}/variants?colorName=${encodeURIComponent(
          newVariantColor
        )}&quantity=${newVariantQty}`
      );
      setVariants([...variants, res.data]);
      setNewVariantColor("");
      setNewVariantQty("");
    } catch {
      setError("Failed to add color variant");
    }
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      await axiosInstance.delete(`/products/${editingId}/variants/${variantId}`);
      setVariants(variants.filter((v) => v.id !== variantId));
    } catch {
      setError("Failed to delete color variant");
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => axiosInstance.delete(`/products/${id}`))
      );
      setBulkDeleteOpen(false);
      loadProducts();
    } catch {
      setError("Failed to delete some products");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkPriceChange = async () => {
    const percent = parseFloat(bulkPricePercent);
    if (isNaN(percent)) {
      setError("Enter a valid percentage");
      return;
    }

    setBulkLoading(true);
    try {
      const selectedProducts = products.filter((p) => selectedIds.has(p.id));

      await Promise.all(
        selectedProducts.map((p) => {
          const newPrice = Math.round(p.price * (1 + percent / 100) * 100) / 100;
          return axiosInstance.put(`/products/${p.id}`, {
            name: p.name,
            description: p.description,
            price: newPrice,
            quantity: p.quantity,
            category: p.categoryId ? { id: p.categoryId } : null,
            supplier: p.supplierId ? { id: p.supplierId } : null,
            subCategory: p.subCategory || null,
          });
        })
      );

      setBulkPriceOpen(false);
      setBulkPricePercent("");
      loadProducts();
    } catch {
      setError("Failed to update some prices");
    } finally {
      setBulkLoading(false);
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

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="border border-ledger-line bg-white rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brass w-64"
        />

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setLowStockOnly(false);
            setPage(0);
          }}
          className="border border-ledger-line bg-white rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brass"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => {
              setLowStockOnly(e.target.checked);
              setCategoryFilter("");
              setPage(0);
            }}
          />
          Low stock only
        </label>
      </div>

      {error && (
        <div className="bg-stamp/10 text-stamp p-3 rounded-sm mb-4 text-sm">
          {error}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="bg-brass/10 border border-brass/30 rounded-sm px-4 py-2 mb-4 flex items-center justify-between text-sm">
          <span className="text-ink font-medium">{selectedIds.size} selected</span>
          <div className="flex gap-3">
            <button
              onClick={() => setBulkPriceOpen(true)}
              className="text-brass-dark hover:underline"
            >
              Change Price
            </button>
            <button
              onClick={() => setBulkDeleteOpen(true)}
              className="text-stamp hover:underline"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-sm border border-ledger-line overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-ledger text-ink text-xs uppercase tracking-wide">
            <tr>
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={products.length > 0 && selectedIds.size === products.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Category</th>
              <th className="p-3 font-semibold">Supplier</th>
              <th
                className="p-3 font-semibold cursor-pointer select-none"
                onClick={() => handleSort("price")}
              >
                Price{sortIndicator("price")}
              </th>
              <th
                className="p-3 font-semibold cursor-pointer select-none"
                onClick={() => handleSort("quantity")}
              >
                Quantity{sortIndicator("quantity")}
              </th>
              <th className="p-3 font-semibold w-44">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-ledger-line">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggleSelect(p.id)}
                  />
                </td>
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
                    onClick={() => openDuplicateModal(p)}
                    className="text-accent hover:underline text-sm"
                  >
                    Duplicate
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
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
          >
            <option value="">-- Select --</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium text-ink mb-1">Subcategory</label>
          <input
            type="text"
            placeholder="e.g. Ball Pen, Gel Pen, Fountain Pen"
            value={form.subCategory}
            onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
            className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-4 text-sm focus:outline-none focus:border-brass"
          />
          <label className="flex items-center gap-2 mb-6 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.deliverable}
              onChange={(e) => setForm({ ...form, deliverable: e.target.checked })}
            />
            Deliverable (uncheck for oversized/bulky items)
          </label>

          {editingId ? (
            <div className="mb-6 border-t border-ledger-line pt-4">
              <label className="block text-sm font-medium text-ink mb-2">
                Color Variants
              </label>

              {variants.length > 0 && (
                <div className="space-y-1 mb-3">
                  {variants.map((v) => (
                    <div
                      key={v.id}
                      className="flex justify-between items-center text-sm bg-ledger px-3 py-1.5 rounded-sm"
                    >
                      <span className="text-ink">
                        {v.colorName} — {v.quantity} in stock
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteVariant(v.id)}
                        className="text-stamp text-xs hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Color name"
                  value={newVariantColor}
                  onChange={(e) => setNewVariantColor(e.target.value)}
                  className="flex-1 border border-ledger-line rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-brass"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={newVariantQty}
                  onChange={(e) => setNewVariantQty(e.target.value)}
                  className="w-20 border border-ledger-line rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-brass"
                />
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="bg-brass hover:bg-brass-dark text-white px-3 py-1.5 rounded-sm text-sm transition"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-text mb-6 border-t border-ledger-line pt-4">
              Save this product first, then click Edit to add color variants.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-brass hover:bg-brass-dark text-white py-2 rounded-sm text-sm transition"
          >
            Save
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={bulkPriceOpen}
        onClose={() => setBulkPriceOpen(false)}
        title={`Change Price for ${selectedIds.size} Products`}
      >
        <label className="block text-sm font-medium text-ink mb-1">
          Percentage change (e.g. 10 for +10%, -10 for -10%)
        </label>
        <input
          type="number"
          value={bulkPricePercent}
          onChange={(e) => setBulkPricePercent(e.target.value)}
          className="w-full border border-ledger-line rounded-sm px-3 py-2 mb-6 text-sm focus:outline-none focus:border-brass"
          placeholder="e.g. 10 or -10"
        />
        <button
          onClick={handleBulkPriceChange}
          disabled={bulkLoading}
          className="w-full bg-brass hover:bg-brass-dark text-white py-2 rounded-sm text-sm transition disabled:opacity-50"
        >
          {bulkLoading ? "Updating..." : "Apply Price Change"}
        </button>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Are you sure you want to delete this product?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        message={`Delete ${selectedIds.size} selected products? This cannot be undone.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </Layout>
  );
}